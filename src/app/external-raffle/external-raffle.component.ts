import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Raffle } from '../interfaces/raffle';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RaffleService } from '../services/raffle.service';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
import { Participante } from '../interfaces/participante';
import { ParticipanteService } from '../services/participante.service';
import Swal from 'sweetalert2';
import { CountdownComponent } from "../componentes/countdown/countdown.component";
import { RaffleExecutionService } from '../services/raffle-execution.service';
import { Subscription } from 'rxjs';
import { ConfettiComponent } from "../componentes/confetti/confetti.component";
import { WebSocketService } from '../services/web-socket.service';
import { PaymentServiceService } from '../services/payment-service.service';
import { PaymentOption } from '../interfaces/payment-option';
import { AuthenticationService } from '../services/authentication.service';
import { TooltipModule } from 'primeng/tooltip';



@Component({
  selector: 'app-external-raffle',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule, ButtonModule, TagModule, DialogModule, TableModule, InputTextModule,
    FormsModule, ReactiveFormsModule, InputMaskModule, CountdownComponent, ConfettiComponent, TooltipModule],
  templateUrl: './external-raffle.component.html',
  styleUrl: './external-raffle.component.scss'
})
export class ExternalRaffleComponent implements OnInit{

  raffle: any = null;
  raffleId: any | null = null;
  responsiveOptions: any[] | undefined;
  visible: boolean = false;
  participantes: Participante[] = [];
  datosParticipantes: boolean = false;
  info:boolean = false;
  displayModal: boolean = false;
  reservationForm!: FormGroup;
  availableNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
  numerosReservados: number[] = [];
  selectedNumber: number = 0;
  raffleCode: any;
  private storageListener = this.onStorageEvent.bind(this);
  showCountdown: boolean = false;
  countdownValue: number | null = null;
  winningNumber: number | null = null;
  winningParticipant: string | null = null;
  phone:string | null = null
  loading:boolean = false;
  winningData: { raffleId: number; winningNumber: number; winningParticipant: string}[] = [];

 private modalShown = false;
private countdownHandled = false
  winningRaffleId: number | null = null;
  showConfetti = false;
  winnerInfo: { name: string; lastName: string; phone: string } | null = null;
  showWinner: boolean = false;
  private subscription!: Subscription;
  raffleExecutionStatus: boolean = false;
  metodosPgo: boolean = false;
  paymentOptions: PaymentOption[] = [];
  paymentMethods: PaymentOption[] = [];
  private paymentSubscription: Subscription | undefined;

 // private paymentSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private rifaService: RaffleService,
    private fb: FormBuilder, private router:Router,
    private raffleExecutionService: RaffleExecutionService,
    private webSocketService: WebSocketService,
    private participanteService: ParticipanteService,
    private paymentService: PaymentServiceService,
    private authService: AuthenticationService
  ) {
      this.reservationForm = this.fb.group({
        name: ['', Validators.required],
        lastName: ['', Validators.required],

        phone: ['', [
          Validators.required,
          Validators.pattern(/^\+54 9 \d{2} \d{4}-\d{4}$/)
        ]],

        code: ['', Validators.required],
        reservedNumber: [{ value: '', disabled: true }, Validators.required]
      });
    }

/*
  ngOnInit(): void {


         const idParam = this.route.snapshot.paramMap.get('id');
  if (idParam) {
    this.raffleId = Number(idParam);

    // 🔍 Intentar obtener la rifa desde el state por si fue navegada internamente
    if (history.state && history.state.raffle) {
      this.raffle = history.state.raffle;
      this.raffleId = this.raffle?.id ?? null;
      this.raffleCode = this.raffle?.code ?? '';
      console.log('🎟️ Código de la rifa obtenido desde state:', this.raffleCode);
      this.initializeForm();
      this.loadParticipantes(this.raffleId);
      this.loadPaymentMethods();
    } else {
      // 🔁 Obtener la rifa desde el backend si no hay datos en el state
      this.cargarRifa(this.raffleId).then(() => {
        this.initializeForm();
        this.loadParticipantes(this.raffleId!);
          this.loadPaymentMethods();
      });
    }

 // 🔥 Escuchar cambios en participantes en tiempo real
  this.participanteService.refreshParticipants$.subscribe((raffleId) => {
    if (raffleId && raffleId === this.raffleId) {
      console.log("🔄 Refrescando participantes en tiempo real...");
      this.loadParticipantes(raffleId);
    }
  });

  // Suscripción a refreshPayments$ (única y persistente)
      this.paymentSubscription = this.paymentService.refreshPayments$.subscribe((userId) => {
        if (this.raffle?.usuario?.id === userId) {
          console.log(`[External] Refresh triggered for user ID: ${userId}`);
          this.loadPaymentMethods();
        }
      });


      this.loadWinningInfo();




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

      const storedWinner = localStorage.getItem(`winner_${this.raffleId}`);
    if (storedWinner) {
        const winnerData = JSON.parse(storedWinner);
        this.winningNumber = winnerData.winningNumber;
        this.winningParticipant = winnerData.winningParticipant;
        this.showWinner = true;
        console.log(`💾 Número ganador restaurado: ${this.winningNumber} - ${this.winningParticipant}`);
    }

 console.log("🔍 Suscribiéndose a WebSockets...");

    this.webSocketService.client.onConnect = () => {
        console.log("✅ WebSocket activo, ahora suscribiéndose...");

        // 🔥 Filtrar por `rifaId` en ejecución del sorteo
        this.webSocketService.subscribeToTopic('raffle-execution').subscribe((message: any) => {
            console.log("📡 Mensaje recibido en ExternalComponent:", message);

            if (message && message.estado === "ejecutando" && message.rifaId === this.raffleId) {
                console.log(`🔔 Sorteo en ejecución para la rifa con ID ${message.rifaId}, mostrando en el componente externo.`);
                this.raffleExecutionStatus = true;
            } else {
                console.log(`⚠️ Ignorando ejecución de rifa con ID ${message?.rifaId}, ya que no coincide con la rifa actual (${this.raffleId}).`);
            }
        });

        // 🔥 Filtrar por `rifaId` en el contador regresivo
        this.webSocketService.subscribeToTopic('countdown').subscribe((message: any) => {
            if (message.rifaId === this.raffleId) {
                console.log(`⏳ Contador regresivo recibido para la rifa ${message.rifaId}: ${message.countdownValue}`);
                this.countdownValue = message.countdownValue;
                this.showCountdown = true;
            } else {
                console.log(`⚠️ Ignorando contador para rifa ${message?.rifaId}, no corresponde a la rifa actual (${this.raffleId}).`);
            }
        });

        // 🔥 Filtrar por `rifaId` en el número ganador
        this.webSocketService.subscribeToTopic('winner').subscribe((message: any) => {
            if (message.rifaId === this.raffleId) {
                console.log(`🏆 Número ganador recibido para la rifa ${message.rifaId}: ${message.winningNumber}`);

                this.winningNumber = message.winningNumber;
                this.winningParticipant = message.ganador
                    ? `${message.ganador.name} ${message.ganador.lastName}`
                    : 'Sin ganador';

                this.showCountdown = false;
                this.showWinner = true;
                  // 🔥 Guardar número ganador en localStorage para que sea persistente
                localStorage.setItem(`winner_${this.raffleId}`, JSON.stringify({
                    winningNumber: this.winningNumber,
                    winningParticipant: this.winningParticipant
                }));

                // 🔥 Verificar si el número ganador estaba reservado
                this.verificarGanadorReservado();
            } else {
                console.log(`⚠️ Ignorando número ganador para rifa ${message?.rifaId}, no corresponde a la rifa actual (${this.raffleId}).`);
            }
        });
    };

    if (!this.webSocketService.client.connected) {
        console.warn("⚠️ WebSocket no estaba conectado, activándolo...");
        this.webSocketService.client.activate();
    }

//this.loadPaymentMethods();

  }




}*/

ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.raffleId = Number(idParam);

      // Intentar obtener la rifa desde el state
      if (history.state && history.state.raffle) {
        this.raffle = history.state.raffle;
        this.raffleId = this.raffle?.id ?? null;
        this.raffleCode = this.raffle?.code ?? '';
        console.log('🎟️ Código de la rifa obtenido desde state:', this.raffleCode);
        this.initializeComponent();
      } else {
        this.cargarRifa(this.raffleId).then(() => {
          this.initializeComponent();
        });
      }

      // Suscripción a refreshParticipants$
      this.participanteService.refreshParticipants$.subscribe((raffleId) => {
        if (raffleId && raffleId === this.raffleId) {
          console.log("🔄 Refrescando participantes en tiempo real...");
          this.loadParticipantes(raffleId);
        }
      });

      // Suscripción a refreshPayments$ (única y persistente)
      this.paymentSubscription = this.paymentService.refreshPayments$.subscribe((userId) => {
        if (this.raffle?.usuario?.id === userId) {
          console.log(`[External] Refresh triggered for user ID: ${userId}`);
          this.loadPaymentMethods();
        }
      });

      // Configuración de WebSockets
      this.webSocketService.client.onConnect = () => {
        console.log("✅ WebSocket activo, ahora suscribiéndose...");
        this.webSocketService.subscribeToTopic('raffle-execution').subscribe((message: any) => {
          if (message && message.estado === "ejecutando" && message.rifaId === this.raffleId) {
            console.log(`🔔 Sorteo en ejecución para la rifa con ID ${message.rifaId}`);
            this.raffleExecutionStatus = true;
          }
        });
        this.webSocketService.subscribeToTopic('countdown').subscribe((message: any) => {
          if (message.rifaId === this.raffleId) {
            console.log(`⏳ Contador regresivo recibido para la rifa ${message.rifaId}: ${message.countdownValue}`);
            this.countdownValue = message.countdownValue;
            this.showCountdown = true;
          }
        });
        this.webSocketService.subscribeToTopic('winner').subscribe((message: any) => {
          if (message.rifaId === this.raffleId) {
            console.log(`🏆 Número ganador recibido para la rifa ${message.rifaId}: ${message.winningNumber}`);
            this.winningNumber = message.winningNumber;
            this.winningParticipant = message.ganador ? `${message.ganador.name} ${message.ganador.lastName}` : 'Sin ganador';
            this.showCountdown = false;
            this.showWinner = true;
            localStorage.setItem(`winner_${this.raffleId}`, JSON.stringify({
              winningNumber: this.winningNumber,
              winningParticipant: this.winningParticipant
            }));
            this.verificarGanadorReservado();
          }
        });
      };
      if (!this.webSocketService.client.connected) {
        console.warn("⚠️ WebSocket no estaba conectado, activándolo...");
        this.webSocketService.client.activate();
      }
    }


setInterval(() => {
    if (this.raffle?.usuario?.id) {
      this.loadPaymentMethods();
    }
  }, 6000);

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    window.removeEventListener('storage', this.storageListener);

/*
    if (this.paymentSubscription) {
      console.log('[Dashboard] Unsubscribing from payment updates');
      this.paymentSubscription.unsubscribe();
    }*/

    if (this.paymentSubscription) {
      this.paymentSubscription.unsubscribe();
    }
    if (this.webSocketService.client.connected) {
      this.webSocketService.client.deactivate();
    }

  }

private initializeComponent(): void {
    this.initializeForm();
    this.loadParticipantes(this.raffleId!);
    this.loadPaymentMethods();
    this.loadWinningInfo();
    this.responsiveOptions = [
      { breakpoint: '1400px', numVisible: 1, numScroll: 1 },
      { breakpoint: '1220px', numVisible: 1, numScroll: 1 },
      { breakpoint: '1100px', numVisible: 1, numScroll: 1 }
    ];
    const storedWinner = localStorage.getItem(`winner_${this.raffleId}`);
    if (storedWinner) {
      const winnerData = JSON.parse(storedWinner);
      this.winningNumber = winnerData.winningNumber;
      this.winningParticipant = winnerData.winningParticipant;
      this.showWinner = true;
      console.log(`💾 Número ganador restaurado: ${this.winningNumber} - ${this.winningParticipant}`);
    }
  }



loadPaymentMethods0(): void {
  if (this.raffle && this.raffle.usuario && this.raffle.usuario.id) {
    const usuarioId = this.raffle.usuario.id;
    console.log(`[External] Loading payment methods for creator ID: ${usuarioId}`);

    // Suscripción inicial
    this.paymentService.getPaymentOptionsByUsuarioId(usuarioId).subscribe({
      next: (data: PaymentOption[]) => {
        console.log('[External] Initial payment methods loaded from backend:', data);
        this.paymentMethods = [...data];
      },
      error: (err) => {
        console.error('[External] Error loading initial payment methods:', err);
        Swal.fire('Error', 'No se pudieron cargar los métodos de pago.', 'error');
      }
    });

    // Suscripción a actualizaciones en tiempo real
    this.paymentSubscription = this.paymentService.refreshPayments$.subscribe((userId) => {
      if (userId === usuarioId) {
        console.log(`[External] Refresh triggered for user ID: ${userId}`);
        this.paymentService.getPaymentOptionsByUsuarioId(usuarioId).subscribe({
          next: (data: PaymentOption[]) => {
            console.log('[External] Payment methods updated from backend:', data);
            this.paymentMethods = [...data];
          },
          error: (err) => {
            console.error('[External] Error updating payment methods:', err);
          }
        });
      }
    });
  } else {
    console.warn('No se encontró usuarioId en la rifa.');
    this.paymentMethods = [];
  }
}

loadPaymentMethods1(): void {
    if (this.raffle && this.raffle.usuario && this.raffle.usuario.id) {
      const usuarioId = this.raffle.usuario.id;
      console.log(`[External] Loading payment methods for creator ID: ${usuarioId}`);

      // Suscripción inicial
      this.paymentService.getPaymentOptionsByUsuarioId(usuarioId).subscribe({
        next: (data: PaymentOption[]) => {
          console.log('[External] Initial payment methods loaded from backend:', data);
          this.paymentMethods = [...data];
        },
        error: (err) => {
          console.error('[External] Error loading initial payment methods:', err);
          Swal.fire('Error', 'No se pudieron cargar los métodos de pago.', 'error');
        }
      });

      // Suscripción a notificaciones de cambio
      this.paymentSubscription = this.paymentService.refreshPayments$.subscribe((userId) => {
        if (userId === usuarioId) {
          console.log(`[External] Refresh triggered for user ID: ${userId}`);
          this.paymentService.getPaymentOptionsByUsuarioId(usuarioId).subscribe({
            next: (data: PaymentOption[]) => {
              console.log('[External] Payment methods updated from backend:', data);
              this.paymentMethods = [...data];
            },
            error: (err) => {
              console.error('[External] Error updating payment methods:', err);
            }
          });
        }
      });
    } else {
      console.warn('No se encontró usuarioId en la rifa.');
      this.paymentMethods = [];
    }
  }

loadPaymentMethods(): void {
    if (this.raffle && this.raffle.usuario && this.raffle.usuario.id) {
      const usuarioId = this.raffle.usuario.id;
      console.log(`[External] Loading payment methods for creator ID: ${usuarioId}`);
      this.paymentService.getPaymentOptionsByUsuarioId(usuarioId).subscribe({
        next: (data: PaymentOption[]) => {
          console.log('[External] Payment methods loaded from backend:', data);
          this.paymentMethods = [...data];
        },
        error: (err) => {
          console.error('[External] Error loading payment methods:', err);
          Swal.fire('Error', 'No se pudieron cargar los métodos de pago.', 'error');
        }
      });
    } else {
      console.warn('No se encontró usuarioId en la rifa.');
      this.paymentMethods = [];
    }
  }


getBankImage(bankCode: string): string {
    const defaultBanks = [
      { name: 'Mercado Pago', code: 'MP', image: 'assets/bancos/MP.jpg' },
      { name: 'Ulala', code: 'UL', image: 'assets/bancos/ulala.jpg' },
      { name: 'Naranja X', code: 'NX', image: 'assets/bancos/naranjax.jpg' },
      { name: 'Banco Nacion', code: 'BN', image: 'assets/bancos/banconacion.jpg' },
      { name: 'Banco Galicia', code: 'BG', image: 'assets/bancos/galicia.jpg' },
      { name: 'Brubank', code: 'BB', image: 'assets/bancos/brubank.jpg' },
      { name: 'Rebanking', code: 'RK', image: 'assets/bancos/reba.jpg' },
      { name: 'Cuenta DNI', code: 'CD', image: 'assets/bancos/dni.jpg' },
      { name: 'Otras', code: 'OT', image: 'assets/bancos/galicia.jpg' },
    ];
    const bank = defaultBanks.find(b => b.code === bankCode);
    return bank ? bank.image : 'assets/bancos/default.jpg';
  }

getBankName(bankCode: string): string {
    const banks = [
      { name: 'Mercado Pago', code: 'MP' },
      { name: 'Ulala', code: 'UL' },
      { name: 'Naranja X', code: 'NX' },
      { name: 'Banco Nacion', code: 'BN' },
      { name: 'Banco Galicia', code: 'BG' },
      { name: 'Brubank', code: 'BB' },
      { name: 'Rebanking', code: 'RK' },
      { name: 'Cuenta DNI', code: 'CD' },
      { name: 'Otras', code: 'OT' },
    ];
    const bank = banks.find(b => b.code === bankCode);
    return bank ? bank.name : bankCode;
  }



  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/bancos/default.jpg';
  }

  hideDialog(): void {
    this.metodosPgo = false;
  }


  onPay(method: PaymentOption): void {
    console.log('Pagar con:', method);
    // Aquí puedes agregar la lógica para procesar el pago (por ejemplo, una llamada al backend o una alerta)
    Swal.fire({
      title: 'Pago iniciado',
      text: `Procesando pago con ${method.alias} (CBU: ${method.cbu})`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
    // Ejemplo: Llamada al backend para procesar el pago (implementar según tu API)
    // this.paymentService.processPayment(method).subscribe(...);

    this.hideDialog()
  }

  verificarGanadorReservado(): void {
    this.participanteService.getParticipantesByRaffleId(this.raffle!.id!).subscribe({
        next: participantes => {
            this.participantes = participantes;
            this.numerosReservados = participantes
                .filter(p => p.reservedNumber !== null)
                .map(p => p.reservedNumber);
            console.log(`✅ Participantes recargados para rifa ${this.raffle?.id}:`, this.participantes);

            const isReserved = this.participantes.some(p => p.reservedNumber === this.winningNumber);

            if (isReserved) {
                this.showConfetti = true;
                setTimeout(() => this.showConfetti = false, 3000);

                Swal.fire({
                    title: '¡Sorteo Ejecutado!',
                    html: `
                        <p>Número ganador: <b>${this.winningNumber}</b></p>
                        <p>Ganador: <b>${this.winningParticipant}</b></p>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
            } else {
                Swal.fire({
                    title: 'Sorteo sin ganador',
                    text: `El número ganador es ${this.winningNumber}, pero no ha sido reservado.`,
                    icon: 'info',
                    confirmButtonText: 'Aceptar'
                });
            }
        },
        error: e => {
            console.error('❌ Error al recargar participantes:', e);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo verificar reservas finales.',
                icon: 'error'
            });
        }
    });
}


private onStorageEvent(event: StorageEvent): void {
    if (!event.key) return;

    if (event.key === 'countdown') {
      const newValue = event.newValue;
      if (newValue !== null) {
        this.countdownValue = parseInt(newValue, 10);
        this.showCountdown = true;
      } else {
        this.showCountdown = false;
      }
      console.log('Contador actualizado desde localStorage:', event.newValue);
    }

    if (event.key === 'winningData') {
      console.log('storage event → winningData:', event.newValue);
      this.loadWinningInfo();
    }
  }





  validateRaffleCode(control: AbstractControl): ValidationErrors | null {
    console.log('🔍 Código ingresado por el usuario:', control.value);
    console.log('✅ Código esperado:', this.raffleCode);
    return control.value === this.raffleCode ? null : { incorrectCode: true };
  }



isInvalid(field: string): boolean {
  const control = this.reservationForm.get(field);
  return control?.invalid && (control.dirty || control.touched) || false;
}




  async cargarRifa(id: number) {
    try {
      const response = await this.rifaService.obtenerRifaPorId(id).toPromise();
      this.raffle = response;
      console.log('Datos de la rifa cargada:', this.raffle);
      console.log('Teléfono del admin:', this.raffle.usuario.telefono);
      this.raffleCode = this.raffle?.code || '';

      const totalParticipantes = this.raffle && this.raffle.cantidadParticipantes

        ? parseInt(this.raffle.cantidadParticipantes, 10)
        : 10;

      this.availableNumbers = Array.from({ length: totalParticipantes }, (_, i) => i + 1);
      console.log('Números disponibles:', this.availableNumbers);
    } catch (error) {
      console.error('❌ Error al cargar la rifa:', error);
    }
  }






  initializeForm() {
    this.reservationForm.get('code')?.setValidators([
      Validators.required,
      this.validateRaffleCode.bind(this)
    ]);
    this.reservationForm.get('code')?.updateValueAndValidity();
  }


  showDialog() {
    this.visible = true;
    }

    mostrarDatosP(){
      this.datosParticipantes = true;
    }

    showInfo() {
      this.info = true
      }

    openModal(number: number) {
      this.selectedNumber = number;
      this.displayModal = true;

      this.reservationForm.patchValue({
        reservedNumber: number
      });
    }



    loadParticipantes(raffleId: number) {

      this.participantes = [];
      this.numerosReservados = [];
      this.participanteService.getParticipantesByRaffleId(raffleId).subscribe({
        next: (data) => {
          this.participantes = data;

          this.numerosReservados = this.participantes.filter(p => p.reservedNumber !== null).map(p => p.reservedNumber);
          console.log('Participantes para la rifa', raffleId, ':', this.participantes);
          console.log('Números reservados:', this.numerosReservados);
        },
        error: (err) => console.error('Error al cargar participantes:', err)
      });
    }



    loadParticipantesPorRifa(raffleId: number): void {

      this.participanteService.getAllParticipantes().subscribe({
        next: (data) => {
          this.participantes = data.filter(p => p.raffleId === raffleId);
          console.log(`Participantes para la rifa ${raffleId}:`, this.participantes);
          this.numerosReservados = this.participantes
          .filter(p => p.reservedNumber !== null)
          .map(p => p.reservedNumber);
        console.log('Participantes para la rifa', raffleId, ':', this.participantes);
        console.log('Números reservados:', this.numerosReservados);
        },
        error: (err) => console.error(`Error al cargar participantes para la rifa ${raffleId}:`, err)
      });
    }






    saveData0(): void {
  if (this.reservationForm.valid) {
    const newReservation: Participante = {
      ...this.reservationForm.getRawValue(),
      raffleId: this.raffleId
    };

    this.participanteService.createParticipante(newReservation).subscribe({
      next: (data) => {
        console.log("✅ Reserva guardada correctamente en el backend:", data);

        // 🔥 Emitir actualización para sincronizar participantes en todos los dispositivos
        this.participanteService.refreshParticipants(this.raffleId!);

        this.reservationForm.reset();
        this.displayModal = false;

        Swal.fire({
          icon: "success",
          title: "¡Reserva exitosa!",
          text: "Tu número ha sido reservado correctamente.",
          confirmButtonText: "Aceptar"
        });
      },
      error: (err) => {
        console.error("❌ Error al reservar número:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo reservar el número. Por favor, inténtalo de nuevo.",
          confirmButtonText: "Aceptar"
        });
      }
    });
  } else {
    Swal.fire({
      icon: "warning",
      title: "Formulario inválido",
      text: "Por favor, completa todos los campos requeridos.",
      confirmButtonText: "Aceptar"
    });
  }
}

 saveData(): void {
  if (this.reservationForm.valid) {
    this.loading = true; // 🔥 Deshabilita el botón mientras se reserva el número

    const newReservation: Participante = {
      ...this.reservationForm.getRawValue(),
      raffleId: this.raffleId
    };

    this.participanteService.createParticipante(newReservation).subscribe({
      next: (data) => {
        console.log("✅ Reserva guardada correctamente en el backend:", data);

        this.participanteService.refreshParticipants(this.raffleId!);
        this.reservationForm.reset();
        this.displayModal = false;
        this.loading = false; // 🔥 Habilita el botón nuevamente

        Swal.fire({
          icon: "success",
          title: "¡Reserva exitosa!",
          text: "Tu número ha sido reservado correctamente.",
          confirmButtonText: "Aceptar"
        });
      },
      error: (err) => {
        console.error("❌ Error al reservar número:", err);
        this.loading = false; // 🔥 Habilita el botón nuevamente
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo reservar el número. Por favor, inténtalo de nuevo.",
          confirmButtonText: "Aceptar"
        });
      }
    });
  } else {
    Swal.fire({
      icon: "warning",
      title: "Formulario inválido",
      text: "Por favor, completa todos los campos requeridos.",
      confirmButtonText: "Aceptar"
    });
  }
}


    closeModal() {
      this.reservationForm.reset();
      this.displayModal = false;
    }

    isReserved(num: number): boolean {
      return this.numerosReservados.includes(num);
    }







onCountdownFinishedExternal(): void {
  if (this.countdownHandled) return;
  this.countdownHandled = true;

  const storedData = localStorage.getItem('winningData');
  if (!storedData) {
    console.log('No se encontró información de ganadores en localStorage.');
    return;
  }

  let winningDataArray: any[];
  try {
    winningDataArray = JSON.parse(storedData);
  } catch {
    console.error('Error al parsear winningData:', storedData);
    return;
  }

  this.winningData = winningDataArray;
  const currentWinner = this.getWinningEntry(this.raffle?.id);
  if (!currentWinner) {
    console.log('No hay información de ganador para esta rifa.');
    return;
  }

  const { winningNumber, winningParticipant } = currentWinner;
  this.winningNumber = winningNumber;
  this.winningParticipant = winningParticipant;
  console.log('Número ganador en ExternalRaffleComponent:', winningNumber);
  console.log('Ganador:', winningParticipant);

  const isReserved = this.participantes.some(
    p => p.raffleId === this.raffle?.id && p.reservedNumber === winningNumber
  );

  if (isReserved) {
    this.showConfetti = true;
    setTimeout(() => this.showConfetti = false, 3000);

    Swal.fire({
      title: '¡Sorteo Ejecutado!',
      text: `El número ganador es ${winningNumber}. Ganador: ${winningParticipant}.`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  } else {
    Swal.fire({
      title: 'Sorteo sin ganador',
      text: `El número ganador es ${winningNumber}, pero no ha sido reservado por ningún participante. La rifa sigue activa.`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }
}







 loadWinningInfo(): void {
    const storedData = localStorage.getItem('winningData');
    let data: any[] = [];
    if (storedData) {
      try {
        data = JSON.parse(storedData);
        if (!Array.isArray(data)) data = [];
      } catch (error) {
        console.error('Error al parsear winningData:', error);
        data = [];
      }
    }
    this.winningData = data;
    console.log('Información de ganadores cargada:', this.winningData);


    if (this.countdownValue === 0 && this.raffle && this.raffle.id) {
      const current = this.getWinningEntry(this.raffle.id);
      if (current) {
        this.modalShown = true;
        this.mostrarModalConGanador(current.winningNumber, current.winningParticipant);
      }
    }
  }





   private mostrarModalConGanador(winningNumber: number, winningParticipant: string): void {

    this.participanteService.getParticipantesByRaffleId(this.raffle!.id!).subscribe({
      next: participantes => {
        this.participantes = participantes;
        this.numerosReservados = participantes
          .filter(p => p.reservedNumber !== null)
          .map(p => p.reservedNumber);
        console.log(`Participantes recargados para rifa ${this.raffle?.id}:`, this.participantes);


        const isReserved = this.participantes.some(
          p => p.reservedNumber === winningNumber
        );

        if (isReserved) {
          this.showConfetti = true;
          setTimeout(() => this.showConfetti = false, 3000);

          Swal.fire({
            title: '¡Sorteo Ejecutado!',
            html: `
              <p>Número ganador: <b>${winningNumber}</b></p>
              <p>Ganador: <b>${winningParticipant}</b></p>
            `,
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            title: 'Sorteo sin ganador',
            text: `El número ganador es ${winningNumber}, pero no ha sido reservado.`,
            icon: 'info',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      error: e => {
        console.error('Error al recargar participantes final:', e);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo verificar reservas finales.',
          icon: 'error'
        });
      }
    });
  }



getWinningEntry(raffleId: number) {
  if (!this.winningData) return null;
  return this.winningData.find(e => e.raffleId === raffleId) || null;
}






shareRaffleViaWhatsApp(): void {
  if (!this.raffleId) {
    console.error('No se puede compartir la rifa porque no se encontró el ID.');
    return;
  }

  // Construir la URL de la rifa
  const raffleUrl = `${window.location.origin}/external-raffle/${this.raffleId}`;

  // Mensaje personalizado para compartir
  const message = `¡Participa en esta rifa increíble! 🎟️\n\n` +
                  //`Código de la rifa: ${this.raffleCode}\n` +
                  `Enlace para participar: ${raffleUrl}`;

  // Codificar el mensaje para incluirlo en la URL de WhatsApp
  const encodedMessage = encodeURIComponent(message);

  // Construir el enlace de WhatsApp para abrir la app directamente
  const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;

  // Abrir el enlace
  window.location.href = whatsappUrl;
}



whatsappAppLink(): string {
  const phone = this.raffle?.usuario?.telefono ?? '';
  const clean = phone.replace(/\D+/g, '');
  const adminName = this.raffle?.usuario?.name ?? 'Administrador';
  const text = encodeURIComponent(`Hola ${adminName}, quisiera participar en su sorteo.`);
  return `whatsapp://send?phone=${clean}&text=${text}`;
}



contactAdminViaWhatsApp(): void {
  const phone = this.raffle?.usuario?.telefono ?? '';
  const clean = phone.replace(/\D+/g, '');
  const adminName = this.raffle?.usuario?.name ?? 'Administrador';
  const text = encodeURIComponent(`Hola ${adminName}, quisiera participar en su sorteo.`);
  const whatsappUrl = `whatsapp://send?phone=${clean}&text=${text}`;
  window.location.href = whatsappUrl;
  setTimeout(() => {
    if (document.hidden) {
      alert('Asegúrate de tener WhatsApp instalado.');
    }
  }, 1000);
}


abrirMetodos(){
this.metodosPgo = true
}



handleScreenTouch(event: TouchEvent): void {
  const target = event.target as HTMLElement;

  if (!target.closest('button') && !target.closest('.interactive-element')) {
    if (this.isMobile()) {
      const tooltipMessage = document.createElement('div');
      tooltipMessage.textContent = 'Ver método de pago';
      tooltipMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.7); color: white; padding: 0.5rem 1rem; border-radius: 4px; z-index: 1000; font-size: 1rem;';
      document.body.appendChild(tooltipMessage);
      setTimeout(() => {
        document.body.removeChild(tooltipMessage);
      }, 1500);
    }
  }
}

isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


}

