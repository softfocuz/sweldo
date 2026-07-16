from sqlalchemy.orm import Session

from app.models.wallet import Wallet


class WalletCRUD:

    def get_all(self, db: Session):
        return db.query(Wallet).all()

    def get(self, db: Session, wallet_id):
        return (
            db.query(Wallet)
            .filter(Wallet.id == wallet_id)
            .first()
        )

    def create(
        self,
        db: Session,
        employee_id,
        public_key,
        network,
    ):
        wallet = Wallet(
            employee_id=employee_id,
            public_key=public_key,
            network=network,
        )

        db.add(wallet)
        db.commit()
        db.refresh(wallet)

        return wallet

    def update(
        self,
        db: Session,
        wallet: Wallet,
        public_key,
        network,
    ):
        wallet.public_key = public_key
        wallet.network = network

        db.commit()
        db.refresh(wallet)

        return wallet

    def delete(
        self,
        db: Session,
        wallet: Wallet,
    ):
        db.delete(wallet)
        db.commit()

    def get_by_employee(
            self,
            db: Session,
            employee_id,
    ):
        return (
            db.query(Wallet)
            .filter(Wallet.employee_id == employee_id)
            .first()
        )

wallet_crud = WalletCRUD()