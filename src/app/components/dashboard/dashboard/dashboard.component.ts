import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';

declare var FusionCharts: any;

import { DataService } from '../../../services/data.service';
import { GridColumn, GridRow } from '../../../models/grid-item.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HighchartsChartModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  columns: GridColumn[] = [];
  rows: (GridRow & { selected?: boolean })[] = [];
  displayedRows: (GridRow & { selected?: boolean })[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 10;
  searchTerm: string = '';
  editingIndex: number | null = null;
  editableRow: any = {};
  teamsInput: string = '';
  newUser: boolean = false;

  isLoading: boolean = true;
  selectAll: boolean = false;

  // new user create schemas
  newRow: GridRow = {
    id: '',
    name: { first_name: '', last_name: '', handle: '' },
    role: '',
    status: '',
    license_used: 0,
    teams: []
  };


  // Hardcoded Highcharts data
  Highcharts: typeof Highcharts = Highcharts;
  highChartOptions: Highcharts.Options = {
    chart: { type: 'column' },
    title: { text: 'License Usage Overview' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    series: [{
      name: 'Licenses Used',
      type: 'column',
      data: [30, 50, 245, 460, 70, 80, 355, 85, 135, 30, 65, 190]
    }],
    credits: {
      enabled: false
    }
  };

  // FusionCharts data
  // fusionChartData = {
  //   chart: {
  //     caption: 'Vendors Monitored',
  //     subCaption: '80% Active',
  //     theme: 'fusion',
  //     doughnutRadius: '60%',
  //     showPercentValues: '1',
  //     showLegend: '0',
  //     showCredits: '0' // hides credits watermark
  //   },
  //   data: [
  //     { label: 'Active', value: '80' },
  //     { label: 'Inactive', value: '20' }
  //   ]
  // };

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.fetchGridData().subscribe((data) => {
      // fetch api data to store in local storage array
      this.columns = data.grid_columns;  
      this.rows = data.grid_data.map((row: GridRow): GridRow & { selected: boolean } => ({
        ...row,
        selected: false
      }));
      this.paginate();
      this.isLoading = false;
    });
  }

  paginate(): void {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    const filtered = this.rows.filter(row =>
      row['name']?.first_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      row['name']?.last_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    // store api data in local storage by CRUD function (insert, update, delete);
    this.displayedRows = filtered.slice(start, end);
  }

  nextPage(): void {
    if ((this.currentPage * this.rowsPerPage) < this.rows.length) {
      this.currentPage++;
      this.paginate();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }

  toggleAllSelection(): void {
    this.rows.forEach(row => row.selected = this.selectAll);
    this.paginate();
  }

  saveEdit(): void {
    const updatedRow = {
      ...this.editableRow,
      teams: this.teamsInput.split(',').map(t => ({
        value: t.trim(),
        background_color: '#F8F5FE',
        text_color: '#886FCE'
      }))
    };

    if (this.newUser) {
      this.rows.push(updatedRow);
    } else if (this.editingIndex !== null) {
      const fullIndex = (this.currentPage - 1) * this.rowsPerPage + this.editingIndex;
      this.rows[fullIndex] = updatedRow;
    }

    this.newUser = false;
    this.editingIndex = null;
    this.paginate();
  }

  cancelEdit(): void {
    this.newUser = false;
    this.editingIndex = null;
    this.editableRow = {};
    this.teamsInput = '';
  }

  deleteRow(index: number): void {
    const row = this.displayedRows[index];
    const name = `${row['name'].first_name} ${row['name'].last_name}`;
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      const fullIndex = this.rows.indexOf(row);
      this.rows.splice(fullIndex, 1);
      alert(`${name} has been deleted.`);
      this.paginate();
    }
  }

  editRow(index: number): void {
    this.editingIndex = index;
    const fullIndex = (this.currentPage - 1) * this.rowsPerPage + index;
    const original = this.rows[fullIndex];
    this.editableRow = {
      ...original,
      ['name']: { ...original['name'] },
      ['teams']: original['teams'] ? [...original['teams']] : []
    };

    this.teamsInput = original['teams']?.map((t: any) => t.value).join(', ') || '';

  }

  addUsed(): void {
    this.editingIndex = null;
    this.newUser = true;

    this.editableRow = {
      name: { first_name: '', last_name: '', handle: '' },
      role: '',
      status: '',
      license_used: 0,
      teams: []
    };
    this.teamsInput = '';
  }

  showFullChart: boolean = false;

  openFullChart(): void {
    this.showFullChart = true;
  }

  closeFullChart(): void {
    this.showFullChart = false;
  }

  totalPages(): number[] {
    const count = Math.ceil(this.rows.length / this.rowsPerPage);
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

}