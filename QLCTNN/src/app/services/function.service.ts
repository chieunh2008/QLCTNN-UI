import { Injectable } from '@angular/core';
import * as fakeFunction from '../shared/data/fakeFunction.json';

@Injectable({ providedIn: 'root' })
export class FunctionService {
  private functions = (fakeFunction as any).default || fakeFunction;


  getFunctionsByUserId(userId: number) {
    const found = this.functions.find((f: any) => f.userId === userId);
    const fakeFunction = this.functions.find((f: any) => f.userId === -1);
    return found ? found.functions : fakeFunction;
  }     
}
