import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '~modules/user/shared/user.model';
import { getMeQuery } from '~modules/user/shared/user-queries.graphql';
import { GetMeResponse } from '~modules/user/interfaces/get-me-response.interface';

export interface ValidatedUser {
  id: number;
  name: string;
  age: number;
  sex: 'male' | 'female';
  country: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private validatedUsers: ValidatedUser[] = [];
  private nextId: number = 1;

  constructor(private apollo: Apollo) {}

  getMe(): Observable<User | null> {
    return this.apollo
      .query({
        query: getMeQuery,
      })
      .pipe(
        map((response: unknown) => {
          return (response as GetMeResponse).data?.me ?? null;
        }),
      );
  }

  addUser(name: string, age: number, sex: 'male' | 'female', country: string): string {
    if (!name || name.trim().length === 0) {
      return 'Name cannot be empty';
    }

    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters long';
    }

    for (const user of this.validatedUsers) {
      if (user.name.toLowerCase() === name.trim().toLowerCase()) {
        return 'Name already exists';
      }
    }

    if (age < 18 || age > 65) {
      return 'Age must be between 18 and 65';
    }

    if (sex === 'female' && !name.trim().endsWith('a')) {
      return 'Name must end with an "a" for female users';
    }

    if (country !== 'CH' && country !== 'DE' && country !== 'AT') {
      return 'Country must be CH, DE, or AT';
    }

    const validatedUser: ValidatedUser = {
      id: this.nextId++,
      name: name.trim(),
      age: age,
      sex: sex,
      country: country,
    };

    this.validatedUsers.push(validatedUser);
    return 'User added successfully';
  }
}
