export class CongTrinhFilter {
  query: string = '';
  startDate: string | null = null;
  endDate: string | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  search: string = '';
  orderBy: string = '';

  constructor(
    query: string = '',
    startDate: string | null = null,
    endDate: string | null = null,
    pageIndex: number = 1,
    pageSize: number = 10,
    search: string = '',
    orderBy: string = ''
  ) {
    this.query = query;
    this.startDate = startDate;
    this.endDate = endDate;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.search = search;
    this.orderBy = orderBy;
  }
}
