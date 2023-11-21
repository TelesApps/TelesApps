import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  private animationType: string = 'animation';
  
  constructor() { }

  noAnimation() {
    this.animationType = '';
    setTimeout(() => {
      this.animationType = 'animation';
    }, 1000);
  }
  
  getAnimationType(): string {
    return this.animationType;
  }


}
