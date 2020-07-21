import { HttpService } from './http.service';
import { HttpHeaders } from '@angular/common/http';

export class BaseService {
    public url: string;
    public model: string;

    constructor(protected service: HttpService) {

    }

    showFields(fields: string[]) {
        this.service.fields['fields'] = fields.toString();
        return this;
    }

    showExtraFields(fields: string[]) {
        this.service.fields['expand'] = fields.toString();
        return this;
    }

    setFields(fields?: Array<any>) {
        if (fields) {
            for (let key in fields) {
                this.service.fields[key] = fields[key];
            }
        }
    }

    setHeaders(headers: HttpHeaders) {
        return this.service.headers =  headers;
    }

    get(id?: number): Promise<any> {
        const idSting = `/${id}`;
        this.service.setUrl(`${this.url}${idSting}`);
        return this.service._get();
    }

    put(entity: any): Promise<any> {
        this.service.setUrl(`${this.url}/${entity.id}`);
        this.service.setEntity(entity);
        return this.service._put();
    }

    delete(id: number): Promise<any> {
        this.service.setUrl(`${this.url}/${id}`);
        return this.service._delete();
    }

    post(entity: any): Promise<any> {
        this.service.setUrl(`${this.url}`);
        this.service.setEntity(entity);
        return this.service._post();
    }

    public isJson(str: string) {
        try {
           JSON.parse(str);
        } catch (e) {
            return false;
        }

        return true;
    }

}