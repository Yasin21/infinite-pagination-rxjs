import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';


@Injectable()
export class MockDataSourceService{

  totalElement = 25;



  public loadData(offset,limit){
    return new Observable((subscriber)=>{
        subscriber.next({
          data: this.getIndexedArray(limit,offset),
          totalElement:this.totalElement
        });
    }).pipe(delay(1000));
  }


  private getIndexedArray(limit,offset){
    // limit if reaches the top element
    limit = Math.min(offset+limit,this.totalElement) - offset;
    if(limit <= 0){
      return [];
    }
    return new Array(limit).fill(null).map((val,index)=>{
      return {
        name : "Item "+ (index + 1 + offset)
      }
    })
  }

}

