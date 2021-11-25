export enum ParentFilter {
  point = 'point'
}

export interface ParamsFilter {
  boardId: number;
  sprints: number[];
  statusesTask?: string[];
}

export const statusesTask = [
  {id: 'Backlog', name: 'Backlog'},
  {id: 'Todo', name: 'Todo'},
  {id: 'InProgress', name: 'InProgress'},
  {id: 'Reopen', name: 'Reopen'},
  {id: 'BlockedIn', name: 'BlockedIn'},
  {id: 'BlockedOut', name: 'BlockedOut'},
  {id: 'ForReview', name: 'ForReview'},
  {id: 'InReview', name: 'InReview'},
  {id: 'ForTesting', name: 'ForTesting'},
  {id: 'InTesting', name: 'InTesting'},
  {id: 'ForBuild', name: 'ForBuild'},
  {id: 'InBuild', name: 'InBuild'},
  {id: 'Done', name: 'Done'},
  {id: 'Closed', name: 'Closed'}
];
