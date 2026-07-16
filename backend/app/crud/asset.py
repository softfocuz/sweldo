from sqlalchemy.orm import Session

from app.models.asset import Asset


class AssetCRUD:

    def get_all(
        self,
        db: Session,
    ):
        return (
            db.query(Asset)
            .order_by(Asset.code)
            .all()
        )

    def get_active(
        self,
        db: Session,
    ):
        return (
            db.query(Asset)
            .filter(
                Asset.is_active.is_(True)
            )
            .order_by(Asset.code)
            .all()
        )

    def get(
        self,
        db: Session,
        asset_id,
    ):
        return (
            db.query(Asset)
            .filter(
                Asset.id == asset_id
            )
            .first()
        )

    def get_by_code(
        self,
        db: Session,
        code: str,
    ):
        return (
            db.query(Asset)
            .filter(
                Asset.code == code.upper()
            )
            .first()
        )

    def create(
        self,
        db: Session,
        *,
        name: str,
        code: str,
        issuer: str | None,
        decimals: int = 7,
        is_native: bool = False,
        is_active: bool = True,
    ):
        asset = Asset(
            name=name,
            code=code.upper(),
            issuer=issuer,
            decimals=decimals,
            is_native=is_native,
            is_active=is_active,
        )

        db.add(asset)
        db.commit()
        db.refresh(asset)

        return asset

    def update(
        self,
        db: Session,
        asset: Asset,
        *,
        name: str,
        issuer: str | None,
        decimals: int,
        is_native: bool,
        is_active: bool,
    ):
        asset.name = name
        asset.issuer = issuer
        asset.decimals = decimals
        asset.is_native = is_native
        asset.is_active = is_active

        db.commit()
        db.refresh(asset)

        return asset

    def delete(
        self,
        db: Session,
        asset: Asset,
    ):
        db.delete(asset)
        db.commit()


asset_crud = AssetCRUD()