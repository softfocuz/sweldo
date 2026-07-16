from sqlalchemy.orm import Session

from app.models.transaction import Transaction


class TransactionCRUD:

    def get_all(self, db: Session):
        return db.query(Transaction).all()

    def get(self, db: Session, transaction_id):
        return (
            db.query(Transaction)
            .filter(Transaction.id == transaction_id)
            .first()
        )

    def get_by_claim(self, db: Session, claim_id):
        return (
            db.query(Transaction)
            .filter(Transaction.claim_id == claim_id)
            .first()
        )

    def create(
        self,
        db: Session,
        claim_id,
        stellar_tx_hash,
        ledger,
        status,
    ):
        transaction = Transaction(
            claim_id=claim_id,
            stellar_tx_hash=stellar_tx_hash,
            ledger=ledger,
            status=status,
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return transaction


transaction_crud = TransactionCRUD()
