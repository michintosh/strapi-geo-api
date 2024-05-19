# 📍 Geo API made with Strapi

This project was born out of the need to have a Strapi-based service to manage geographic data, primarily for Italy.

In cases where you want to create a chained frontend form, where selecting a region unlocks the associated provinces, and selecting the provinces unlocks the cities, and with the cities, the zip codes, this is a Strapi REST project specifically designed for that use case.

At the moment, the supported database is mySQL, in the future other databases will be added.
## Table of Contents

1. [Getting Started](#getting-started)
2. [Strapi Usage](#strapi-usage)
    - [`develop`](#develop)
    - [`start`](#start)
    - [`build`](#build)
3. [Import Data](#import-data)
4. [Update Data](#update-data)
5. [Authorize Routes](#authorize-routes)
6. [Fetch Nations](#fetch-nations)
7. [Fetch Regions Associated with a Specific Nation (only Italy)](#fetch-regions-associated-with-a-specific-nation-only-italy)
8. [Fetch Provinces Associated with a Specific Region (only Italy)](#fetch-provinces-associated-with-a-specific-region-only-italy)
9. [Fetch Cities Associated with a Specific Province (only Italy)](#fetch-cities-associated-with-a-specific-province-only-italy)
10. [Fetch ZIP Codes Associated with a Specific City (only Italy)](#fetch-zip-codes-associated-with-a-specific-city-only-italy)
11. [Contribute](#-contribute)
12. [Deployment](#-deployment)
13. [Learn More](#-learn-more)
14. [Community](#-community)

## Getting Started

You need to have an installation of mySQL running on your machine.
Then you have to create a database dedicated for this application.
Then create a `.env` file where to setup the following variables:
```
HOST=0.0.0.0
PORT=1337
APP_KEYS="toBeModified1,toBeModified2"
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified
# Database
DATABASE_CLIENT=mysql
DATABASE_HOST=your-mysql-host
DATABASE_PORT=your-mysql-port
DATABASE_NAME=your-mysql-database-name
DATABASE_USERNAME=your-mysql-database-user
DATABASE_PASSWORD=your-mysql-database-password
DATABASE_SSL=false
```


## Strapi usage

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## Import Data

The data is based on the [gardainformatica.it](https://www.gardainformatica.it/database-comuni-italiani#scarica) dataset.

For running the importer, after having correctly setup Strapi, run the command `yarn geo:import`

## Update Data

Whenever the data needs to be updated a script should be runned to download and extract the JSON files (TODO)

Since the filename of the gardainformatica.it archive can change based on the last update date, there isn't right now a way to have a dynamic scraper, if someone can suggest how to implement that, that will be much appreciated 😁

## Authorize routes

It's much advised to setup the [Strapi API Tokens](https://docs.strapi.io/dev-docs/configurations/api-tokens) for this application, otherwise you could simply make all of the endpoint publicly available (at your own risk).

You can create an API Token by following [this guide](https://docs.strapi.io/user-docs/settings/API-tokens) using these parameters:
| Setting name | Instructions |
|----------------|---------------------------------------------------|
| Name | insert a name of your choice (eg.: "Geo API Dev") |
| Description | insert a description of your choice |
| Token Duration | unlimited |
| Token Type | read-only |

## Fetch Nations

To query nations in your database through Strapi REST api, you can use this endpoint:
`GET {{strapi_url}}/api/nations`

That will output this response:

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "code": "122",
        "title": "MAN (ISOLA)",
        "createdAt": "2024-05-19T08:23:39.000Z",
        "updatedAt": "2024-05-19T08:23:39.000Z",
        "belfioreCode": "Z122"
      }
    }
    //...
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 12,
      "total": 295
    }
  }
}
```

In case you receive a `403 Forbidden` error, make sure to have correctly setup your API Token in the Authorization header, or if you want to have all of the routes publicy avaiable configure them in the [User & Permissions Plugin settings in Strapi](https://docs.strapi.io/dev-docs/plugins/users-permissions#public-role).

Keep in mind that you can use all of the [Strapi Filters rules](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication), so if you want to query a nation which the name includes the string "ita" you can do it so by fetching:

`GET {{strapi_url}}/api/nations?filters[title][$containsi]=ital`

```json
{
  "data": [
    {
      "id": 152,
      "attributes": {
        "code": "IT",
        "title": "ITALIA",
        "createdAt": "2024-05-19T08:23:39.000Z",
        "updatedAt": "2024-05-19T08:23:39.000Z",
        "belfioreCode": ""
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

## Fetch Regions associated with a specific Nation (only Italy)

CURRENTLY WORKS ONLY FOR THE ITALIAN REGIONS

If you want to fetch all of the region of a specific nation, you can do it by fetching:

`GET {{strapi_url}}/api/regions?&filters[nation][id][$eq]={{your_nation_database_id}}`

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "code": "01",
        "title": "Piemonte",
        "createdAt": "2024-05-19T08:23:39.000Z",
        "updatedAt": "2024-05-19T08:23:39.000Z"
      }
    }
    //...
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 20
    }
  }
}
```

In case you receive a `403 Forbidden` error, make sure to have correctly setup your API Token in the Authorization header, or if you want to have all of the routes publicy avaiable configure them in the [User & Permissions Plugin settings in Strapi](https://docs.strapi.io/dev-docs/plugins/users-permissions#public-role).

Keep in mind that you can use all of the [Strapi Filters rules](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication), so if you want to query a region which the name includes the string "mar" you can do it so by fetching:

`GET {{strapi_url}}/api/regions?filters[title][$containsi]=mar&filters[nation][id][$eq]={{your_nation_database_id}}`

```json
{
  "data": [
    {
      "id": 11,
      "attributes": {
        "code": "11",
        "title": "Marche",
        "createdAt": "2024-05-19T08:23:39.000Z",
        "updatedAt": "2024-05-19T08:23:39.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

## Fetch Provinces associated with a specific Region (only Italy)

CURRENTLY WORKS ONLY FOR THE ITALIAN PROVINCES

If you want to fetch all of the provinces of a specific region, you can do it by fetching:

`GET {{strapi_url}}/api/provinces?&filters[region][id][$eq]={{your_region_database_id}}`

```json
{
  "data": [
    {
      "id": 3,
      "attributes": {
        "code": "AN",
        "title": "Ancona",
        "createdAt": "2024-05-19T08:23:39.000Z",
        "updatedAt": "2024-05-19T08:23:39.000Z"
      }
    }
    //...
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 5
    }
  }
}
```

In case you receive a `403 Forbidden` error, make sure to have correctly setup your API Token in the Authorization header, or if you want to have all of the routes publicy avaiable configure them in the [User & Permissions Plugin settings in Strapi](https://docs.strapi.io/dev-docs/plugins/users-permissions#public-role).

Keep in mind that you can use all of the [Strapi Filters rules](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication), so if you want to query a province which the name includes the string "asc" you can do it so by fetching:

`GET {{strapi_url}}/api/provinces?filters[title][$containsi]=asc&filters[region][id][$eq]={{your_nation_database_id}}`

```json
{
  "data": [
    {
      "id": 5,
      "attributes": {
        "code": "AP",
        "title": "Ascoli Piceno",
        "createdAt": "2024-05-19T08:23:39.000Z",
        "updatedAt": "2024-05-19T08:23:39.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

## Fetch Cities associated with a specific Province (only Italy)

CURRENTLY WORKS ONLY FOR THE ITALIAN CITIES

If you want to fetch all of the cities of a specific province, you can do it by fetching:

`GET {{strapi_url}}/api/cities?&filters[province][id][$eq]={{your_province_database_id}}`

```json
{
  "data": [
    {
      "id": 4106,
      "attributes": {
        "code": "044001",
        "title": "Acquasanta Terme",
        "belfioreCode": "A044",
        "lon": 13.4093022,
        "lat": 42.7690896,
        "createdAt": "2024-05-19T08:23:54.000Z",
        "updatedAt": "2024-05-19T08:23:54.000Z"
      }
    }
    //...
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 2,
      "total": 33
    }
  }
}
```

In case you receive a `403 Forbidden` error, make sure to have correctly setup your API Token in the Authorization header, or if you want to have all of the routes publicy avaiable configure them in the [User & Permissions Plugin settings in Strapi](https://docs.strapi.io/dev-docs/plugins/users-permissions#public-role).

Keep in mind that you can use all of the [Strapi Filters rules](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication), so if you want to query a city which name includes the string "san b" you can do it so by fetching:

`GET {{strapi_url}}/api/cities?filters[title][$containsi]=san b&filters[province][id][$eq]={{your_province_database_id}}`

```json
{
  "data": [
    {
      "id": 4136,
      "attributes": {
        "code": "044066",
        "title": "San Benedetto del Tronto",
        "belfioreCode": "H769",
        "lon": 13.8829086,
        "lat": 42.9436023,
        "createdAt": "2024-05-19T08:23:55.000Z",
        "updatedAt": "2024-05-19T08:23:55.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

## Fetch ZIP Codes associated with a specific City (only Italy)

CURRENTLY WORKS ONLY FOR THE ITALIAN ZIP CODES

If you want to fetch all of the zip codes of a specific city, you can do it by fetching:

`GET {{strapi_url}}/zip-codes?&filters[city][id][$eq]={{your_city_database_id}}`

```json
{
  "data": [
    {
      "id": 4413,
      "attributes": {
        "code": "63074",
        "title": "63074",
        "createdAt": "2024-05-19T08:24:31.000Z",
        "updatedAt": "2024-05-19T08:24:31.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

In case you receive a `403 Forbidden` error, make sure to have correctly setup your API Token in the Authorization header, or if you want to have all of the routes publicy avaiable configure them in the [User & Permissions Plugin settings in Strapi](https://docs.strapi.io/dev-docs/plugins/users-permissions#public-role).


## ✨ Contribute

Any help for extending this application is very much appreciated!
The first big limit of this application is that is just related to extensive information about Italy, which was the aim of the original necessity, but nothing excludes it from being available for every other countries!

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
