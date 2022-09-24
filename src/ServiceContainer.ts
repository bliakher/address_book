import { DataSource } from "typeorm"
import { UserDatabase } from "./user_db/UserDatabase"
import { ContactDatabase } from "./contact_db/ContactDatabase"
import { TokenManager } from "./authentication/TokenManager";


export class ServiceContainer {

    public readonly userDatabase: UserDatabase;
    public readonly userDataSource: DataSource;
    public readonly contactDatabase: ContactDatabase;
    public readonly tokenManager: TokenManager;

    constructor(fromBuilder: ServiceContainerBuilder) {
        this.userDataSource = fromBuilder.userDataSourceFactory(this);
        this.userDatabase = fromBuilder.userDatabaseFactory(this);
        this.contactDatabase = fromBuilder.contactDatabaseFactory(this);
        this.tokenManager = fromBuilder.tokenManagerFactory(this);
    }
}

type ServiceFactory<T> = (ServiceContainer) => T;

export class ServiceContainerBuilder {

    userDatabaseFactory: ServiceFactory<UserDatabase>;
    userDataSourceFactory: ServiceFactory<DataSource>;
    contactDatabaseFactory: ServiceFactory<ContactDatabase>;
    tokenManagerFactory: ServiceFactory<TokenManager>;

    async build(): Promise<ServiceContainer> {
        const container = new ServiceContainer(this);

        await container.userDataSource.initialize();
        container.contactDatabase.initialize();

        return container;
    }
}

