import { Component } from '@angular/core';
import {InfiniteScrollDataAdapter} from './helper/infinite-scroll-data.adapter';
import {Observable, of} from 'rxjs';
import {MockDataSourceService} from './services/mock-data-source.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  data$:InfiniteScrollDataAdapter;


  constructor(private mockDataSource:MockDataSourceService) {

  }


  ngOnInit(){
    this.data$ = new InfiniteScrollDataAdapter(this.getSource(),10);
  }


  getSource(){
    return (offset, limit):Observable<any>=>{
      return this.mockDataSource.loadData(offset,limit).pipe(map((data:any)=>{
        return data;
      }));
    }
  }

  loadMore() {
    this.data$.loadMore();

  }

  reset() {
    this.data$.reload();
  }
}
