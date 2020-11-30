[![Version](https://img.shields.io/docker/v/adisakshya/event-service/latest?logo=docker&logoColor=white)](https://hub.docker.com/r/adisakshya/event-service)
[![Travis Badge](https://img.shields.io/travis/com/adisakshya/event-service/master?logo=travis)](https://travis-ci.com/github/adisakshya/event-service)
[![MIT License](https://img.shields.io/github/license/adisakshya/event-service)](https://github.com/adisakshya/event-service/blob/master/LICENSE)
[![PR's Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/adisakshya/event-service/pulls)
[![Code of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat)](https://continuous-improvement.readthedocs.io/en/latest/md/community/code_of_conduct.html)  


## Overview

This microservice is the heart of the system which maintain a catalogue of all the events generated for operations happening in the system. The place where all these events are stored is called the event-store, which in this case is implemented using DynamoDB. 

An event is a representation of the state of an entity-object at a particular point in time. So storing events corresponding to an entity-object over a period of time can tell us how that entity-object changed its state over that period of time and we never lose data despite having delete operations in our system.

After processing and storing the incoming event in the event-store this service can pack the received event with some additional information depending on event-type and sends a new event-message to a relevant AWS SNS topic where the desired consumer is ready to consume this event and perform the required operations in response and this consumer may generate more events which may be consumed by some other services.

The event-service is also interfaced with a PostgreSQL database as well for managing CRUD operations on the notification-entity based on incoming events. Notifications stored in the database are fetched by the [notification-scheduler](https://github.com/adisakshya/custom-scheduler) and forwarded to the [notification-service](https://github.com/adisakshya/notification-service) which then send these notifications to the clients.

## Operating Instructions

### Fork

- Fork this repository
	- "Forking" adds a copy of [adisakshya/event-service](https://github.com/adisakshya/event-service/) repository to your GitHub account as `https://github.com/YourGitHubUserName/event-service`
- Or you can download or clone this repository
	- You can clone the repository executing below command in a location of your choice in your system
	- ```$ git clone https://github.com/adisakshya/event-service.git```
- Source code for the event-service can be found at ```/src```
- All CI/CD resources are located in ```.travis``` directory
- ```requirements.txt``` contain the python packages required for the CI/CD process
- ```.env.example``` is a template env file

### Local Development

#### Prerequisites

- Make sure you have
    - Installed Docker (when running using docker)
    - DynamoDB ```event-store``` running
    - PostgreSQL ```notification-database``` running and accessible using host-url, username and password
    - AWS SQS ```event-queue``` setup and is accessible using queue URL
    - AWS SNS ```event-topic and notification-topic``` setup and is accessible using ARN

#### Using Docker

- In source directory ```src/``` run the following command
	- ```$ yarn install``` - install required dependencies
	- ```$ yarn build``` - build source code
	- ```$ yarn test``` - run test (optional)
	- ```$ docker build -t event-service .``` - build docker image
- With successful execution of above commands you will have a docker-image for the event-service
- The docker-image can be run using the following command
    - ```docker run -p 3000:3000 --env-file ./.env event-service```
- On successful start, the event-service is ready to consume event-messages from the event-queue

#### Without Docker

- Replace the env-variables at ```/src/src/common/api-config.service.ts```
- Use the following commands to start the service
    - ```$ yarn install``` - install required dependencies
    - ```$ yarn test``` - run test (optional)
    - ```$ yarn start``` - start event-service
- On successful start, the API documentaion (built using Swagger) for the service will be accssible on ```http://localhost:3000/docs```

## Architecture

![Event Service Architecture](https://raw.githubusercontent.com/adisakshya/event-service/master/assets/event-service-architecture.png) Fig 1 - Event Service Architecture

This is an internal service and should not be accessible by clients. The event-service has 2 modules namely:

- Event Module
    1. Event Controller - Polls the event-queue for available events and process them
    2. Event Service - Defines the logic to process incoming events
    3. Event Repo - Defines interaction with the event-store
- Notification Module - Defines the logic to handle CRUD operations on notification-database

## CI/CD and Deployment Guide

A brief description of the deployment strategy is described in [documentation of continuous-improvement project](https://continuous-improvement.readthedocs.io).

## Contributing

There are multiple ways to contribute to this project, read about them [here](https://continuous-improvement.readthedocs.io/en/latest/md/community/contributing.html).

## License

All versions of the app are open-sourced, read more about this [LICENSE](https://github.com/adisakshya/event-service/blob/master/LICENSE).
