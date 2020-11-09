
import {of as observableOf, Observable, Subject} from 'rxjs';

import {map, catchError} from 'rxjs/operators';
import {HttpClient, HttpHandler, HttpParams, HttpHeaders, HttpResponse} from '@angular/common/http';

import {Params} from '@app/params';
import {Injectable} from '@angular/core';
import {LocalStorageHelper} from '@app/helpers/localStorage.helper';

interface Options {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
}

import { environment } from 'src/environments/environment';

@Injectable()
export class HttpService extends HttpClient {

    private url:string;
    private entity:any;
    public headers: HttpHeaders;
    private defaultHeaders: HttpHeaders;
    private param:Params = new Params;
    public fields:Array<string> = [];
    public inProgressObserv: Subject<boolean> = new Subject();
    private readonly MARKET_EXCEPTION_CODE = 1020;

    constructor(handler: HttpHandler) {
        super(handler);
    }

    setHeaders(sendFile = false) {
        if (this.headers) {
            this.defaultHeaders = this.headers;
        } else {
            // create authorization header with jwt token
            let headerJson;
            if (sendFile) {
                headerJson = {
                    'Accept': 'application/json',
                };
                //'Content-Type': sendFile ? 'multipart/form-data' : 'application/json',
            } else {
                headerJson = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                };
            }

            if (this.getAccessToken()) {
                headerJson = Object.assign(headerJson, {'Authorization': 'Bearer ' + this.getAccessToken()});
            }

            this.defaultHeaders = new HttpHeaders(headerJson);
        }
    }

    setUrl(url: string, sendFile = false, useDef = true) {
        this.setHeaders(sendFile);
        this.url = (useDef ? this.param.apiUrl : '') + url;
        this.addParameters();
    }

    private addParameters(): void {
        let qs = '';
        for (const key in this.fields) {
            const value = this.fields[key];
            qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
        }
        if (qs.length > 0) {
            qs = qs.substring(0, qs.length - 1); //chop off last "&"
            this.url += '?' + qs;
        }
        this.fields = [];
    }

    setEntity(entity: any) {
        this.entity = entity;
    }

    setSendFile() {
        this.defaultHeaders.delete('Content-Type');
        this.defaultHeaders.append('Content-Type',  'multipart/form-data');
    }

    _get(): Promise<any> {
        return this.get(this.url, this.getOptions([], null, 'response'))
            .toPromise()
            .then(response => this.handleResponse(response))
            .catch(error => this.handleError(error));
    }

    _getObserv(): Observable<any> {
        return this.get(this.url, this.getOptions([], null, 'response')).pipe(
            map(x => this.handleResponseObserv(x)));
    }

    _post(): Promise<any> {
        return this.post(this.url, this.entity, this.getOptions())
            .toPromise()
            .then(response => this.handleResponse(response))
            .catch(error => this.handleError(error));
    }

    _put(): Promise<any> {
        return this.put(this.url, this.entity, this.getOptions())
            .toPromise()
            .then(response => this.handleResponse(response))
            .catch(error => this.handleError(error));
    }

    _delete(): Promise<void> {
        return this.delete(this.url, this.getOptions())
            .toPromise()
            .then(response => this.handleResponse(response))
            .catch(error => this.handleError(error));
    }

    protected handleResponseObserv(response: Object | HttpResponse<any>) {
        let responseBody;
        if (response instanceof HttpResponse) {
            responseBody = response.body;
        } else {
            responseBody = response;
        }
        return responseBody;
    }

    protected handleResponse(response: Object | HttpResponse<any>) {
        let responseBody;
        if (response instanceof HttpResponse) {
            responseBody = response.body;
        } else {
            responseBody = response;
        }
        return responseBody;
    }

    protected handleError(error: any) {
        console.error(error);
    }

    private decodeErrorMessage(err: any) {
        let errList = {};
        if (err.details) {
            if (typeof err.details === 'string') {
               
            } else {
                errList['paragraphs'] = [];
                for (const i in err.details) {
                    if (err.details[i]) {
                        if (err.details[i] instanceof Array) {
                            err.details[i].forEach(element => {
                                
                            });
                        } else {
                            
                        }
                    }
                }
            }
        } else {
            
        }
        return errList;
    }

    private isJson(str: string) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }

        return true;
    }

    private getAccessToken(): string {
        let authData: any;
        authData = LocalStorageHelper.getlocalStorage('authData');
        if (authData) {
            authData = JSON.parse(authData);
            if (authData.accessToken) {
                return authData.accessToken;
            }
        }
        return '';
    }

    public parseRespone(respone): any {
        const res = respone.json();
        if (res.success) {
            return res.content;
        } else {
            return res.errors;
        }
    }

    public __get(params: any = []): Observable<any> {
        return this.get(this.url, this.getOptions(params)).pipe(
            map(response =>
                this.handleResponse(response)),
            catchError(err =>
                this.handleErrorObs(err)),);
    }

    private getOptions(params: any = [], responseType = null, observe = null) {
        let options: Options = {};
        options.headers = this.defaultHeaders;

        if (params) {
            let paramsHttp: HttpParams = new HttpParams();
            for (const k in params) {
                paramsHttp = paramsHttp.set(k, params[k].toString());
            }
            options.params = paramsHttp;
        }
        if (observe) {
            options.observe = observe;
        }
        if (responseType) {
            options.responseType = responseType;
        }
        return options;
    }

    protected handleErrorObs(error: any) {
        let errList = {};
        if (Array.isArray(error)) {
            for (const msg of error) {
                errList = Object.assign(errList, this.decodeErrorMessage(msg));
            }
        } else {
            errList = this.decodeErrorMessage(error);
        }

        if (console && console.error && !environment.production) {
            console.error(errList);
        }
        return observableOf(errList);
    }

    getInProgressObserv(): Observable<any> {
        return this.inProgressObserv.asObservable();
    }

    getBlob(params: any = []): Observable<any> {
        return this.get(this.url, this.getOptions(params, 'blob')).pipe(
            catchError(this.handleObservableError())
        );
    }

    private handleObservableError<T>(result?: T) {
        return (error: any): Observable<T> => {
            if (console && console.error && !environment.production) {
                console.error(error);
            }
            return observableOf(result as T);
        };
    }
}
