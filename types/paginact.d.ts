declare module "paginact" {
  interface UsePaginationResult {
    totalNumberOfItems: number;
    itemsPerPage: number;
    numberOfPages: number;
    firstPageIndex: number | null;
    lastPageIndex: number | null;
    currentPageIndex: number | null;
    offset: number;
    startItemIndexOnCurrentPage: number | null;
    endItemIndexOnCurrentPage: number | null;
    previousPageIndex: number | null;
    nextPageIndex: number | null;
    setTotalNumberOfItems: (newTotalNumberOfItems: number) => void;
    setItemsPerPage: (newItemsPerPage: number) => void;
    setCurrentPageIndex: (newCurrentPageIndex: number) => void;
  }

  function usePagination(
    initialTotalNumberOfItems?: number,
    initialItemsPerPage?: number,
    initialCurrentPageIndex?: number
  ): UsePaginationResult;

  export default usePagination;
}
