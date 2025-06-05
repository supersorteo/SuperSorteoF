import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputMaskModule } from 'primeng/inputmask';
import { Participante } from '../../interfaces/participante';
import { ParticipanteService } from '../../services/participante.service';
@Component({
  selector: 'app-datos-rifa',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule, ButtonModule, TagModule, DialogModule, TableModule, InputTextModule,
    FormsModule, ReactiveFormsModule, InputMaskModule],
  templateUrl: './datos-rifa.component.html',
  styleUrl: './datos-rifa.component.scss'
})
export class DatosRifaComponent implements OnInit {


  raffleId: any | null = null;
  raffle: any = null;
  responsiveOptions: any[] | undefined;
  visible: boolean = false;
  //numbers: number[] = [];
  numbers: number[] = Array.from({ length: 100 }, (_, i) => i + 1);
  //participantes:any[]=[];
  participantes: Participante[] = [];
  datosParticipantes: boolean = false;
  displayModal: boolean = false;
  //selectedNumber: number | null = null;
  reservationForm!: FormGroup;
  availableNumbers = Array.from({ length: 10 }, (_, i) => i + 1); // [1, 2, ..., 10]
  numerosReservados: number[] = [];
  selectedNumber: number = 0;

  reservationData1 = {
    name: '',
    lastName: '',
    phone: '',
    dni: '',
    code: ''
  };

  constructor(private route: ActivatedRoute, private fb: FormBuilder,  private participanteService: ParticipanteService) {
    this.reservationForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{6,8}$/)]], // Validación para el formato de teléfono
      dni: ['', Validators.required],
      code: ['', Validators.required],
      reservedNumber: [{ value: '', disabled: true }, Validators.required]
    });
    //this.availableNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
  if (idParam) {
    this.raffleId = Number(idParam); // Convertir a número
    console.log('ID de la rifa seleccionada:', this.raffleId);
    // Aquí, si tienes el objeto rifa en history.state, podrías asignarlo
    this.cargarRifa();
    // Por ejemplo, si la rifa tiene cantidadParticipantes:
    if (this.raffle && this.raffle.cantidadParticipantes) {
      this.availableNumbers = Array.from({ length: this.raffle.cantidadParticipantes }, (_, i) => i + 1);
    }
    // Cargar participantes para la rifa actual
    this.loadParticipantes(this.raffleId);
  } else {
    console.error('No se encontró el ID de la rifa en la URL.');
  }





   this.responsiveOptions = [
    {
        breakpoint: '1400px',
        numVisible: 1,
        numScroll: 1
    },
    {
        breakpoint: '1220px',
        numVisible: 1,
        numScroll: 1
    },
    {
        breakpoint: '1100px',
        numVisible: 1,
        numScroll: 1
    }


];



  }



  cargarRifa() {
    this.raffle = history.state.raffle;
    console.log('Datos de la rifa seleccionada:', this.raffle);
    if (this.raffle && this.raffle.cantidadParticipantes) {
      this.availableNumbers = Array.from({ length: this.raffle.cantidadParticipantes }, (_, i) => i + 1);
    }
    // Limpiar arrays previos
    this.participantes = [];
    this.numerosReservados = [];
  }

  showDialog() {
    this.visible = true;
    }

    mostrarDatosP(){
      this.datosParticipantes = true;
    }


    openModal(number: number) {
      this.selectedNumber = number;
      this.displayModal = true;

      this.reservationForm.patchValue({
        reservedNumber: number
      });
    }


loadParticipantes(raffleId: number) {
  // Limpia los arrays antes de cargar los participantes para la rifa actual
  this.participantes = [];
  this.numerosReservados = [];
  this.participanteService.getParticipantesByRaffleId(raffleId).subscribe({
    next: (data) => {
      this.participantes = data;
      // Extraer solo los números reservados válidos
      this.numerosReservados = this.participantes
        .filter(p => p.reservedNumber !== null)
        .map(p => p.reservedNumber);
      console.log('Participantes para la rifa', raffleId, ':', this.participantes);
      console.log('Números reservados:', this.numerosReservados);
    },
    error: (err) => console.error('Error al cargar participantes:', err)
  });
}




    saveData1() {
      if (this.reservationForm.valid) {
        console.log('✅ Datos enviados:', this.reservationForm.getRawValue());
        const newReservation = this.reservationForm.getRawValue()
        this.participantes.push(newReservation);
        this.reservationForm.reset(); // 🔄 Resetea el formulario completamente
        this.numerosReservados.push(this.selectedNumber);
        this.displayModal = false; // Cierra el modal
      }
    }


saveData() {
  if (this.reservationForm.valid) {
    // Crea el objeto de reserva e incluye el id de la rifa
    const newReservation: Participante = {
      ...this.reservationForm.getRawValue(),
      raffleId: this.raffleId // Asigna el id obtenido de la URL
    };
    this.participanteService.createParticipante(newReservation).subscribe({
      next: (data) => {
        console.log('✅ Datos enviados:', data);
        // Actualiza la lista de participantes para esta rifa
        this.loadParticipantes(Number(this.raffleId));
        this.reservationForm.reset();
        this.displayModal = false;
      },
      error: (err) => console.error('Error al enviar datos al API:', err)
    });
  }
}







    closeModal() {
      this.reservationForm.reset(); // 🔄 Resetea el formulario al cerrar sin enviar
      this.displayModal = false;
    }

    isReserved(num: number): boolean {
      return this.numerosReservados.includes(num);
    }
}
