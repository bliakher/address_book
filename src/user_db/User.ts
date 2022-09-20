import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {
    @PrimaryGeneratedColumn({ type: "int" })
    id: number;
    @Column({ type: "varchar", length: 256 })
    email: string;
    @Column({ type: "varchar", length: 512 })
    passwordHash: string;
    @Column({ type: "varchar", length: 32 })
    salt: string;
}