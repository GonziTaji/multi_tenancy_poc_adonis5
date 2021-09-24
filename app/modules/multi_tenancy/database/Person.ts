import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export class Person extends BaseModel {
    public static table = 'person';

    // must have column decorated for lucid to detect the column
    @column()
    public fullname: string;
}
