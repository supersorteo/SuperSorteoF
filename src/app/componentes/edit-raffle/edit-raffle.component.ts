import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Raffle } from '../../interfaces/raffle';
import { ActivatedRoute, Router } from '@angular/router';
import { RaffleService } from '../../services/raffle.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-edit-raffle',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DialogModule, DropdownModule],
  templateUrl: './edit-raffle.component.html',
  styleUrl: './edit-raffle.component.scss',
  providers: [MessageService],
})
export class EditRaffleComponent  implements OnInit{
  @ViewChild('editableDiv') editableDiv!: ElementRef;
  @ViewChild('modalEditor') modalEditor!: ElementRef;
  descripcionInvalida: boolean = false;

  raffle!: Raffle;
  raffleId!: number;
  loading: boolean = false;
  showFormatDialog: boolean = false;
  displayFormatDialog: boolean = false;
  fontOptions = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Tahoma', value: 'Tahoma' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    { label: 'Impact', value: 'Impact' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS' }
  ];


  fontSizes = [
    { label: 'Pequeño', value: '2' },
    { label: 'Mediano', value: '3' },
    { label: 'Grande', value: '5' },
    { label: 'Muy Grande', value: '7' },
  ];
  selectedFontSize: string = '';
  selectedFont: string = '';
  textColor: string = '#000000';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private raffleService: RaffleService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {

 // Obtén el id de la rifa de la URL (ej: /edit-raffle/123)
 const idParam = this.route.snapshot.paramMap.get('id');
 if (idParam) {
   this.raffleId = +idParam;
   this.loadRaffle();
 } else {
   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se recibió el ID de la rifa' });
   this.router.navigate(['/dashboard']);
 }

  }


  loadRaffle1(): void {
    this.raffleService.obtenerRifaPorId(this.raffleId).subscribe({
      next: (data: Raffle) => {
        this.raffle = data;
        console.log('data', data)
      },
      error: (error) => {
        console.error('Error al cargar la rifa:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la rifa' });
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadRaffle(): void {
    this.raffleService.obtenerRifaPorId(this.raffleId).subscribe({
      next: (data: Raffle) => {
        this.raffle = data;
        console.log('datos', this.raffle)
        setTimeout(() => {
          if (this.editableDiv) {
            this.editableDiv.nativeElement.innerHTML =
              this.raffle.producto.descripcion || '';
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar la rifa:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la rifa',
        });
        this.router.navigate(['/dashboard']);
      },
    });
  }

  onDescriptionChange(): void {
    const html = this.editableDiv?.nativeElement.innerHTML || '';
    this.descripcionInvalida = html.length > 1500;
    this.raffle.producto.descripcion = html;
  }


/*
  onSubmit(): void {
    if (!this.raffle) {
      return;
    }
    this.loading = true;
    this.raffleService.updateRaffle(this.raffleId, this.raffle).subscribe({
      next: (updatedRaffle: Raffle) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rifa actualizada correctamente' });
        // Al actualizar, redirige al dashboard para actualizar la grid
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error al actualizar la rifa:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la rifa' });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }*/


    onSubmit(): void {
      if (!this.raffle || this.descripcionInvalida) {
        return;
      }

      this.raffle.producto.descripcion = this.editableDiv.nativeElement.innerHTML;

      this.loading = true;
      this.raffleService.updateRaffle(this.raffleId, this.raffle).subscribe({
        next: (updatedRaffle: Raffle) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rifa actualizada correctamente',
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error al actualizar la rifa:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la rifa',
          });
        },
        complete: () => {
          this.loading = false;
        },
      });
    }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  openFormatDialog(): void {
    this.modalEditor.nativeElement.innerHTML = this.editableDiv.nativeElement.innerHTML;
    this.displayFormatDialog = true;
  }

  closeFormatDialog(applyChanges: boolean): void {
    if (applyChanges) {
      this.editableDiv.nativeElement.innerHTML = this.modalEditor.nativeElement.innerHTML;
      this.onDescriptionChange();
    }
    this.displayFormatDialog = false;
  }



  applyFormat(command: string): void {
    document.execCommand(command, false);
  }

  applyFont(): void {
    if (this.selectedFont) {
      document.execCommand('fontName', false, this.selectedFont);
    }
  }

  applyFontSize(): void {
    if (this.selectedFontSize) {
      document.execCommand('fontSize', false, this.selectedFontSize);
    }
  }

  applyTextColor(): void {
    if (this.textColor) {
      document.execCommand('foreColor', false, this.textColor);
    }
  }


}
