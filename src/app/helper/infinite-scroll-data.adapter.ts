import {BehaviorSubject, combineLatest, Observable, PartialObserver, Subscribable, Unsubscribable} from 'rxjs';
import {map, scan, switchMap, tap} from 'rxjs/operators';


const log = (message) => tap((data)=>console.log(message,data));


export class InfiniteScrollDataAdapter implements Subscribable<any>{

  _dataSource$:Observable<any>;

  subscribe(observer?: PartialObserver<any>): Unsubscribable;
  subscribe(next: null | undefined, error: null | undefined, complete: () => void): Unsubscribable;
  subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Unsubscribable;
  subscribe(next: (value: any) => void, error: null | undefined, complete: () => void): Unsubscribable;
  subscribe(next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Unsubscribable;
  subscribe(observer?: PartialObserver<any> | null | undefined | ((value: any) => void), error?: null | undefined | ((error: any) => void), complete?: () => void): Unsubscribable {
    return this._dataSource$.subscribe(...arguments);
  }


  // Current offset as observable
  private _offset$ = new BehaviorSubject(0);


  // Current limit as observable
  private _limit$:BehaviorSubject<any>;

  // Loading state as observable
  public loading$ = new BehaviorSubject(false);


  // if you can load more element....
  public hasMore$ = new BehaviorSubject(true);


  // Remaining Count Observable
  public remainingCount$ = new BehaviorSubject(0);


  // Total Count Observable
  public totalCount$ = new BehaviorSubject(0);


  /***
   *
   * @param _dataSource Give a function tha returns observable that result in {data,totalElement}
   * @param _limit limit per fetch
   */
  constructor(private _dataSource:(offset,limit)=>Observable<any>,_limit:number) {
    // Set The limit into an observable ...
    this._limit$ = new BehaviorSubject(_limit || 10);
    // Load Data source....
    this._dataSource$  = combineLatest(this._offset$,this._limit$).pipe(
      // Loading On
      tap(()=>this.loading$.next(true)),

      // Load Data from data source
      switchMap(([offset,limit])=>this._dataSource(offset,limit)
        .pipe(map(({data,totalElement})=>{ return {offset,data,totalElement,limit} } )
      )),
      // Set hasMore$, remainingCount$, totalCount$ ....
      tap(({totalElement,offset,limit})=>{
        this.hasMore$.next(totalElement > offset + limit);
        this.remainingCount$.next(Math.max(totalElement - offset - limit,0));
        this.totalCount$.next(totalElement);
      }),
      // Accumulate data into 1 array
      scan((acc,data)=>{
        // if Offset is 0 THEN
        return data.offset == 0 ?
          // Reset the data counter
          data.data :
          // Put the data at the current list
          [...acc,...data.data]

      },[]),

      // Turn off loading
      tap(()=>this.loading$.next(false))
    );
  }



  /**
   * This method will allow you to reload the list
   */
  reload(){
    this._offset$.next(0);
  }

  /**
   * This method will allow you load more in the list
   */
  loadMore(){
    if(this.loading$.getValue()){
      return;
    }
    this._offset$.next(this._offset$.getValue() + this._limit$.getValue());
  }


}

