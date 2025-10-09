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
import { RifaGanadorDTO } from '../../interfaces/rifa-ganador-dto';
import { Participante } from '../../interfaces/participante';
import { ParticipanteService } from '../../services/participante.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-raffle',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DialogModule, DropdownModule],
  templateUrl: './edit-raffle.component.html',
  styleUrl: './edit-raffle.component.scss',
  providers: [MessageService],
})
export class EditRaffleComponent implements OnInit {
  @ViewChild('editableDiv') editableDiv!: ElementRef;
  @ViewChild('modalEditor') modalEditor!: ElementRef;
  descripcionInvalida: boolean = false;

  raffle!: Raffle;
  raffleId!: number;
  loading: boolean = false;
  showFormatDialog: boolean = false;
  displayFormatDialog: boolean = false;
  fontOptions = [{ label: 'Arial', value: 'Arial' }, { label: 'Times New Roman', value: 'Times New Roman' }, { label: 'Courier New', value: 'Courier New' }, { label: 'Verdana', value: 'Verdana' }, { label: 'Tahoma', value: 'Tahoma' }, { label: 'Trebuchet MS', value: 'Trebuchet MS' }, { label: 'Impact', value: 'Impact' }, { label: 'Comic Sans MS', value: 'Comic Sans MS' }];
  fontSizes = [{ label: 'Pequeño', value: '2' }, { label: 'Mediano', value: '3' }, { label: 'Grande', value: '5' }, { label: 'Muy Grande', value: '7' }];
  selectedFontSize: string = '';
  selectedFont: string = '';
  textColor: string = '#000000';
  participantes: any[] = [];
  winningParticipant: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private raffleService: RaffleService,
    private participanteService: ParticipanteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.raffleId = +idParam;
      this.loadRaffle();
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se recibió el ID de la rifa' });
      this.router.navigate(['/dashboard']);
    }
  }

  loadRaffle(): void {
    console.log("🔍 Iniciando carga de la rifa con ID:", this.raffleId);

    forkJoin([
      this.raffleService.getRaffleById(this.raffleId),
      this.participanteService.getParticipantesByRaffleId(this.raffleId)
    ]).subscribe({
      next: ([raffleData, participantsData]: [RifaGanadorDTO | Raffle, Participante[]]) => {
        console.log("📌 Respuesta completa del backend para rifa:", raffleData);
        console.log("📌 Participantes cargados:", participantsData);

        if ('rifa' in raffleData) {
          this.raffle = raffleData.rifa as Raffle;
          this.participantes = raffleData.participantes || participantsData || [];
          this.winningParticipant = raffleData.ganador ? `${raffleData.ganador.name} ${raffleData.ganador.lastName}` : 'Sin ganador';
        } else {
          this.raffle = raffleData as Raffle;
          this.participantes = participantsData || [];
          this.winningParticipant = 'Sin ganador';
        }

        console.log("✅ Rifa obtenida:", this.raffle);
        console.log("✅ Participantes cargados:", this.participantes);
        console.log("✅ Ganador:", this.winningParticipant);

        setTimeout(() => {
          if (this.editableDiv) {
            this.editableDiv.nativeElement.innerHTML = this.raffle.producto.descripcion || '';
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al cargar la rifa o participantes:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la rifa' });
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onDescriptionChange(): void {
    const html = this.editableDiv?.nativeElement.innerHTML || '';
    this.descripcionInvalida = html.length > 1500;
    this.raffle.producto.descripcion = html;
  }

  onSubmit(): void {
    if (!this.raffle || this.descripcionInvalida) {
      return;
    }

    const nuevaCantidad = this.raffle.cantidadParticipantes;
    console.log(`🔍 Nueva cantidad de participantes: ${nuevaCantidad}`);

    const numerosReservados = this.participantes
      .filter(p => p.reservedNumber !== null)
      .map(p => p.reservedNumber);

    console.log("📌 Números reservados en la rifa:", numerosReservados);

    const numerosFueraDeRango = numerosReservados.filter(num => num > nuevaCantidad);
    console.log("⚠️ Números fuera de rango:", numerosFueraDeRango);

    if (numerosFueraDeRango.length > 0) {
      const numerosFuera = numerosFueraDeRango.join(', ');
      Swal.fire({
        icon: 'error',
        title: 'Error en la edición',
        text: `No puede reducir la cantidad de participantes a ${nuevaCantidad} porque los números reservados ${numerosFuera} están fuera de rango. Debe eliminar esas reservaciones antes de continuar.`,
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.raffle.producto.descripcion = this.editableDiv.nativeElement.innerHTML;
    this.loading = true;

    this.raffleService.updateRaffle(this.raffleId, this.raffle).subscribe({
      next: (updatedRaffle: Raffle) => {
        console.log('✅ Rifa actualizada con éxito:', updatedRaffle);

        // Actualizar en localStorage usando el ID del usuario de la rifa
        const localKey = `raffles_${this.raffle.usuario.id}`;
        const localRaffles = JSON.parse(localStorage.getItem(localKey) || '[]');
        const updatedIndex = localRaffles.findIndex((r: Raffle) => r.id === updatedRaffle.id);
        if (updatedIndex !== -1) {
          localRaffles[updatedIndex] = updatedRaffle;
        } else {
          localRaffles.push(updatedRaffle);
        }
        localStorage.setItem(localKey, JSON.stringify(localRaffles));

        Swal.fire({
          icon: 'success',
          title: 'Rifa actualizada',
          text: '¡Se ha actualizado correctamente!',
          confirmButtonText: 'Aceptar'
        });

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('❌ Error al actualizar la rifa:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error en la actualización',
          text: 'No se pudo actualizar la rifa.',
          confirmButtonText: 'Aceptar'
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
