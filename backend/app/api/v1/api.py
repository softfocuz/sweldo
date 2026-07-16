from fastapi import APIRouter
from fastapi.routing import APIRoute

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import users
from app.api.v1.endpoints import payrolls
from app.api.v1.endpoints import assets
from app.api.v1.endpoints import wallets
from app.api.v1.endpoints import employers
from app.api.v1.endpoints import employees
from app.api.v1.endpoints import claims
from app.api.v1.endpoints import stellar
from app.api.v1.endpoints import scheduler
from app.api.v1.endpoints import milestones
from app.api.v1.endpoints import transactions

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    payrolls.router,
    prefix="/payrolls",
    tags=["Payrolls"],
)

api_router.include_router(
    assets.router,
    prefix="/assets",
    tags=["Assets"],
)

api_router.include_router(
    wallets.router,
    prefix="/wallets",
    tags=["Wallets"],
)

api_router.include_router(
    employers.router,
    prefix="/employers",
    tags=["Employers"],
)

api_router.include_router(
    employees.router,
    prefix="/employees",
    tags=["Employees"],
)

api_router.include_router(
    claims.router,
    prefix="/claims",
    tags=["Claims"],
)

api_router.include_router(
    stellar.router,
    prefix="/stellar",
    tags=["Stellar"],
)

api_router.include_router(
    scheduler.router,
    prefix="/scheduler",
    tags=["Scheduler"],
)

api_router.include_router(
    milestones.router,
    prefix="/milestones",
    tags=["Milestones"],
)

api_router.include_router(
    transactions.router,
    prefix="/transactions",
    tags=["Transactions"],
)

print("\nAPI ROUTES")
for route in api_router.routes:
    if isinstance(route, APIRoute):
        print(
            route.methods,
            route.path,
            route.endpoint.__name__,
        )