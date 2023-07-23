import uvicorn
import strawberry
from fastapi import FastAPI
from strawberry.asgi import GraphQL
from fastapi.middleware.cors import CORSMiddleware
import typing


@strawberry.type
class User:
    name: str
    age: int


def get_users():
    return [
        User(
            name="Patrich",
            age=21,
        ),
    ]

@strawberry.type
class Query:
    users: typing.List[User] = strawberry.field(resolver=get_users)


schema = strawberry.Schema(query=Query)
graphql_app = GraphQL(schema)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_route("/graphql", graphql_app)
app.add_websocket_route("/graphql", graphql_app)

# Run the app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
