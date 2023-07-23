import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';


// We use the gql tag to parse our query string into a query document
const GET_USERS = gql`
  query GetUsers {
    users {
      name,
      age
    }
  }
`;

@Component({
  selector: 'app-root',
  template: `
    <ul>
      <li *ngFor="let user of users">
        {{user.name}} {{user.age}}
      </li>
    </ul>

  `
})
export class AppComponent implements OnInit, OnDestroy {
  users!: any;

  private querySubscription!: Subscription;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.querySubscription = this.apollo
      .watchQuery<any>({
        query: GET_USERS,
      })
      .valueChanges.subscribe(({ data, loading }) => {
        this.users = data.users;
      });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}
