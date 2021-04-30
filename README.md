# Node Starter

I needed a TS + Node starter, so I took [this](https://github.com/microsoft/TypeScript-Node-Starter) and ripped out all of the views since I want a JSON API only app. Should be able to reuse this for a GraphQL app really easily since this is very bare-bones.

## includes

- Node 14 + Express
- TypeScript
- Docker
- Terraform
- Jest
- Prettier
- Eslint

## Development

Update your `.env` file with appropriate values (see another team member)

```
$ cp .env.example .env
```

```
$ docker-compose up
```


## Debugging

If you're using VS Code then you can use the built-in debugger. After you have the app running with `docker-compose` then you can start the `Docker: Debugger` in the debugger tab.
