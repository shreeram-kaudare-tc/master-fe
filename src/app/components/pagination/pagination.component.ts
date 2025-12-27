import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pagination',
  imports: [FormsModule, NgClass],
  standalone: true,
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {

  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Output() onPageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() items_per_page: EventEmitter<number> = new EventEmitter<number>();

  params: any = {}


  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      this.params.page = params['page'] || 1;
      this.params.page_size = params['page_size'] || 10;
      this.currentPage = parseInt(this.params.page || 1);
      this.itemsPerPage = parseInt(this.params.page_size || 10);
    });
  }

  handlePrevClick() {
      this.totalPages = this.totalItems / this.itemsPerPage
    if (this.currentPage > 1) {
      this.navigateToPage(parseInt((this.currentPage || 1) + '') - 1);
    }
  }

  handleNextClick() {
    this.totalPages = this.totalItems / this.itemsPerPage
    if (this.currentPage < this.totalPages) {
      this.navigateToPage(parseInt((this.currentPage || 1) + '') + 1);
    }
  }

  // show_item_per_page() {
  //   this.onPageChange.emit(this.totalItems);
  // }

  navigateToPage(event: any) {
    this.currentPage = event
    this.totalPages = this.totalItems / this.itemsPerPage
    const queryParams = {
      page: this.currentPage,
      page_size: this.itemsPerPage,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge', // existing params maintain karto
    });
    this.onPageChange.emit(this.currentPage); // page change event emit karto
  }


  renderPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const displayFirstPages = 2;
    const displayLastPages = 2;

    for (let i = 1; i <= this.totalPages; i++) {
      if (
        i <= displayFirstPages ||
        i > this.totalPages - displayLastPages ||
        (i === this.currentPage && this.currentPage > displayFirstPages && this.currentPage <= this.totalPages - displayLastPages)
      ) {
        pageNumbers.push(i);
      } else if (
        (i === displayFirstPages + 1 && this.currentPage > displayFirstPages + 1) ||
        (i === this.totalPages - displayLastPages && this.currentPage < this.totalPages - displayLastPages)
      ) {
        pageNumbers.push(-1); // Use -1 to represent "..."
      }
    }

    return pageNumbers;
  }


  get showingTo(): number {
    return Math.min((this.currentPage || 1) * this.itemsPerPage, this.totalItems);
  }

}
