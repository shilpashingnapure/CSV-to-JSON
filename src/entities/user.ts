import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {

  @PrimaryGeneratedColumn()
  id : string;
  
  @Column()
  name: string;

  @Column()
  age : number;

  @Column({ type : 'jsonb' ,  nullable : true})
  address : object;

  @Column({ type : 'jsonb' , nullable : true })
  additional_info : object;





  
}
