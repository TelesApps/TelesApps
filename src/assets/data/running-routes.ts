import { Course, Route } from '../../app/interfaces/tracker.interface';

export const routes: Route[] = [
  {
    slug: 'lakeSouthOption',
    name: 'Lake South Option',
    miles: 0.6027,
    kilometers: 0.97,
  },
  {
    slug: 'lakeMainStart',
    name: 'Lake Main Start',
    miles: 0.3168,
    kilometers: 0.51,
  },
  {
    slug: 'lakeLoop',
    name: 'Lake Loop',
    miles: 1.3680,
    kilometers: 2.20,
  },
  {
    slug: 'straightAway',
    name: 'Straight Away',
    miles: 0.2610,
    kilometers: 0.42,
  },
  {
    slug: 'hospitalRunToGladys',
    name: 'Hospital Run to Gladys',
    miles: 1.9573,
    kilometers: 3.15,
  },
  {
    slug: 'hospitalRunToGym',
    name: 'Hospital Run to Gym',
    miles: 2.3674,
    kilometers: 3.81,
  },
  {
    slug: 'gymToHome',
    name: 'Gym to Home',
    miles: 1.0625,
    kilometers: 1.71,
  },
  {
    slug: 'gladysToHome',
    name: 'Gladys to Home',
    miles: 0.6648,
    kilometers: 1.07,
  },
  {
    slug: 'gladysToSouthOption',
    name: 'Gladys to South Option',
    miles: 0.7270,
    kilometers: 1.17,
  },
  {
    slug: 'gymToSouthOption',
    name: 'Gym to South Option',
    miles: 1.1246,
    kilometers: 1.81,
  },
  {
    slug: 'gymToLakeMainStart',
    name: 'Gym to Lake Main Start',
    miles: 1.1246,
    kilometers: 1.81,
  },
  {
    slug: 'gladysToLakeMainStart',
    name: 'Gladys to Lake Main Start',
    miles: 0.6648,
    kilometers: 1.07,
  },
  {
    slug: 'adrianDaleToSouthOption',
    name: 'Adrian Dale to South Option',
    miles: 1.0563,
    kilometers: 1.70,
  },
  {
    slug: 'mileSprint',
    name: 'Mile Sprint',
    miles: 1.0,
    kilometers: 1.62,
  },
  {
    slug: 'postSwimRunHome',
    name: 'Post Swim Run Home',
    miles: 0.9688,
    kilometers: 1.56,
  },
];

export function createCourses(routes: Route[]): Course[] {
  return [
    {
      slug: 'mileSprint',
      name: 'Mile Sprint',
      routes: [
        routes.find(route => route.slug === 'mileSprint')!
      ]
    },
    {
      slug: 'postSwimRunHome',
      name: 'Post Swim Run Home',
      routes: [
        routes.find(route => route.slug === 'postSwimRunHome')!
      ]
    },
    {
      slug: 'lakeRun1x',
      name: 'Lake Run 1x',
      routes: [
        routes.find(route => route.slug === 'lakeMainStart')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'straightAway')!,
      ]
    },
    {
      slug: 'lakeRun2x',
      name: 'Lake Run 2x',
      routes: [
        routes.find(route => route.slug === 'lakeMainStart')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'straightAway')!,
      ]
    },
    {
      slug: 'lake2xSOption',
      name: 'Lake 2x S Option',
      routes: [
        routes.find(route => route.slug === 'lakeSouthOption')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'straightAway')!,
      ]
    },
    {
      slug: 'lakeRun3x',
      name: 'Lake Run 3x',
      routes: [
        routes.find(route => route.slug === 'lakeMainStart')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'straightAway')!,
      ]
    },
    {
      slug: 'lake3xSOption',
      name: 'Lake 3x S Option',
      routes: [
        routes.find(route => route.slug === 'lakeSouthOption')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'straightAway')!,
      ]
    },
    {
      slug: 'hospitalRun',
      name: 'Hospital Run',
      routes: [
        routes.find(route => route.slug === 'hospitalRunToGladys')!,
        routes.find(route => route.slug === 'gladysToHome')!,
      ]
    },
    {
      slug: 'hospitalGymRun',
      name: 'Hospital Gym Run',
      routes: [
        routes.find(route => route.slug === 'hospitalRunToGym')!,
        routes.find(route => route.slug === 'gymToHome')!,
      ]
    },
    {
      slug: 'adriandaleLakeRun',
      name: 'Adrian Dale Lake Run',
      routes: [
        routes.find(route => route.slug === 'adrianDaleToSouthOption')!,
        routes.find(route => route.slug === 'lakeSouthOption')!,
        routes.find(route => route.slug === 'lakeLoop')!,
        routes.find(route => route.slug === 'straightAway')!,
      ]
    },
    {
      slug: 'customCourse',
      name: 'Custom Course',
      routes: []
    }
  ];
} 