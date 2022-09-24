import express from 'express';
import "reflect-metadata";
import dotenv from "dotenv";
import { UserDatabase } from './user_db/UserDatabase';
import { TokenManager } from './authentication/TokenManager';
import { ServiceContainerBuilder } from './ServiceContainer';
import { configureExpress, registerAppServices } from './app';

(async () => {


    dotenv.config();

    const containerBuilder = new ServiceContainerBuilder();
    registerAppServices(containerBuilder);
    const services = await containerBuilder.build();
    const app = configureExpress(services);

    app.listen(process.env.PORT, () => {
        console.log("Server running on port " + process.env.PORT);
    });


})()
