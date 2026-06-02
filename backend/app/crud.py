from decimal import Decimal

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app import models, schemas

LOW_STOCK_THRESHOLD = 10


def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise ValueError("Product SKU must be unique")
    return db_product


def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    update_data = product.model_dump(exclude_unset=True)
    if "quantity_in_stock" in update_data and update_data["quantity_in_stock"] < 0:
        raise ValueError("Product quantity cannot be negative")
    for key, value in update_data.items():
        setattr(db_product, key, value)
    try:
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise ValueError("Product SKU must be unique")
    return db_product


def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True


def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()


def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()


def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    try:
        db.commit()
        db.refresh(db_customer)
    except IntegrityError:
        db.rollback()
        raise ValueError("Customer email must be unique")
    return db_customer


def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return False
    db.delete(db_customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Cannot delete customer with existing orders")
    return True


def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
        )
        .order_by(models.Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_order(db: Session, order_id: int):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
        )
        .filter(models.Order.id == order_id)
        .first()
    )


def create_order(db: Session, order: schemas.OrderCreate):
    customer = get_customer(db, order.customer_id)
    if not customer:
        raise ValueError("Customer not found")

    product_ids = [item.product_id for item in order.items]
    if len(product_ids) != len(set(product_ids)):
        raise ValueError("Duplicate products in the same order are not allowed")

    products_map: dict[int, models.Product] = {}
    for item in order.items:
        product = get_product(db, item.product_id)
        if not product:
            raise ValueError(f"Product with id {item.product_id} not found")
        if product.quantity_in_stock < item.quantity:
            raise ValueError(
                f"Insufficient stock for product '{product.name}'. "
                f"Available: {product.quantity_in_stock}, requested: {item.quantity}"
            )
        products_map[item.product_id] = product

    total = Decimal("0")
    order_items_data = []
    for item in order.items:
        product = products_map[item.product_id]
        line_total = Decimal(str(product.price)) * item.quantity
        total += line_total
        order_items_data.append(
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": product.price,
            }
        )

    db_order = models.Order(customer_id=order.customer_id, total_amount=total)
    db.add(db_order)
    db.flush()

    for item_data in order_items_data:
        db_item = models.OrderItem(order_id=db_order.id, **item_data)
        db.add(db_item)
        product = products_map[item_data["product_id"]]
        product.quantity_in_stock -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)
    return get_order(db, db_order.id)


def delete_order(db: Session, order_id: int):
    db_order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not db_order:
        return False

    for item in db_order.items:
        product = get_product(db, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(db_order)
    db.commit()
    return True


def get_dashboard_stats(db: Session):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock = (
        db.query(models.Product)
        .filter(models.Product.quantity_in_stock <= LOW_STOCK_THRESHOLD)
        .order_by(models.Product.quantity_in_stock.asc())
        .all()
    )
    return schemas.DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock,
    )


def order_to_response(order: models.Order) -> schemas.OrderResponse:
    return schemas.OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        total_amount=order.total_amount,
        created_at=order.created_at,
        customer_name=order.customer.full_name if order.customer else None,
        items=[
            schemas.OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                product_name=item.product.name if item.product else None,
            )
            for item in order.items
        ],
    )
