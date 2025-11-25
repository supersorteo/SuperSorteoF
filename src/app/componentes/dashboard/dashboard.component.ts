import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthenticationService } from '../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RaffleService } from '../../services/raffle.service';
import { ListboxModule } from 'primeng/listbox';
import Swal from 'sweetalert2';
import { Raffle } from '../../interfaces/raffle';
import { FileUploadModule } from 'primeng/fileupload';
import { User } from '../../interfaces/user';
import { Producto } from '../../interfaces/producto';
import { catchError, forkJoin, of, Subscription, switchMap, tap } from 'rxjs';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { SidebarModule} from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { Participante } from '../../interfaces/participante';
import { ParticipanteService } from '../../services/participante.service';
import { RaffleBannerComponent } from "../raffle-banner/raffle-banner.component";
import { DropdownModule } from 'primeng/dropdown';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CountdownComponent } from "../countdown/countdown.component";
import { RaffleExecutionService } from '../../services/raffle-execution.service';
import { RaffleResultService } from '../../services/raffle-result.service';
import { WebSocketService } from '../../services/web-socket.service';
import { RifaGanadorDTO } from '../../interfaces/rifa-ganador-dto';
import { CardModule } from 'primeng/card';
import { CodigoVipServiceService } from '../../services/codigo-vip-service.service';
/*
interface WinningEntry {
  raffleId: number;
  winningNumber: number;
  winningParticipant: string;
  phone: string;
}*/

export interface WinningEntry {
  rifa: {
    id: number;
    nombre: string;
    cantidadParticipantes: number;
    fechaSorteo: string;
    winningNumber?: number;
    producto: Producto
  };
  ganador?: {
    id: number;
    name: string;
    lastName: string;
    phone: string;
    reservedNumber: number;
    raffleId: number;
  } | null;
  participantes: {
    id: number;
    name: string;
    lastName: string;
    phone: string;
    reservedNumber: number | null;
  }[];
}

declare var MercadoPago: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ReactiveFormsModule, FormsModule, DialogModule, ButtonModule, InputTextModule, CardModule,
    TableModule, TagModule,
    CalendarModule, InputTextareaModule, ListboxModule, FileUploadModule, CarouselModule, TagModule, SidebarModule, ToastModule,
    SpeedDialModule, RaffleBannerComponent, DropdownModule, CountdownComponent],
    providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>;
  @ViewChild(RaffleBannerComponent) raffleBannerComponent!: RaffleBannerComponent;

  @ViewChild('raffleBanner') raffleBanner!: RaffleBannerComponent;

 // @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  userName: string = '';
  userId!: any;
  daysLeft: number = 30;
  activeRaffles: Raffle[] = [];
  completedRaffles: any[] = [];
  userRaffles: any[] = [];

 newRaffle: Raffle = {
   nombre: '',
   cantidadParticipantes: null, // 🔥 Inicializamos como número
   //fechaSorteo: new Date(),
  fechaSorteo: new Date().toISOString().split('T')[0],
   usuario: { id: this.userId, esVip: false },
   producto: {
     nombre: '',
     descripcion: '',
     imagenes: []
   },
   active: true,
   executed: false,
   precio: null,
   code: ''
 };


  newlyCreatedRaffle: any = null;
  selectedRaffle!: Raffle;
  displayBanner: boolean = false;
  imageDataUrl: string | null = null;
  // Para la rifa
  nombreSorteoInvalido: boolean = false;
  cantidadInvalida: boolean = false;
  descripcionInvalida: boolean = false;
  fechaSorteoInvalida: boolean = false;

  // Para el producto
nombreProductoInvalido: boolean = false;
descripcionProductoInvalida: boolean = false;
imagenProductoInvalida: boolean = false;

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];


participantes: any[] = [];
numerosReservados: number[] = [];
raffleId: any | null = null;
  codigoVip: string = '';
  fechaRegistro!: any;
  raffle: Raffle | null = null;
  cantidadRifas: number = 0;
  isVip!: boolean | null;
  tieneRifa!: boolean;
  subida:boolean = false;
  mensaje = '';

  displayDialog: boolean = false;

  participantsText: string = '';

  newParticipant: string = '';

  displayProductDialog: boolean = false;

  displayDialog1: boolean = false;

  productData: Producto = {
    id: 0,
    nombre: '',
    descripcion: '',
    imagenes: []
  };

  selectedFile: File | null = null;
  selectedFiles1: File[] = [];
  selectedFiles: (any | null)[] = [];
  previews: (string | null)[] = [];
  uploading: boolean = false;
  subscription!: Subscription;

  sidebarVisible: boolean = false;
  datosParticipantes: boolean = false;
  datosParticipantesFinalizados: boolean = false;
  remainingTime: { days: number; hours: number; minutes: number; seconds: number } = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  private timerInterval: any;
  currentUser: any;


winningNumber: number | null = null;
winningParticipant: string | null = null;
winningRaffleId: number | null = null;
//winningData: { raffleId: number; winningNumber: number; winningParticipant: string }[] = [];
winningData: WinningEntry[] = [];
winningEntries: Map<number, WinningEntry> = new Map();
  displayFormatDialog: boolean = false;
  // Variables para el formato
  selectedFont: string = '';
  fontSize: number = 14;
  textColor: string = '#000000';
  selectedFontSize: string = '3';

private db: IDBDatabase | null = null;

  fontOptions = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Tahoma', value: 'Tahoma' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    { label: 'Impact', value: 'Impact' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS' }
  ];

  fontSizes = [
    { label: 'Pequeño', value: '2' },
    { label: 'Normal', value: '3' },
    { label: 'Grande', value: '4' },
    { label: 'Muy Grande', value: '5' },
    { label: 'Enorme', value: '6' }
  ];

  safeDescription!: SafeHtml;

  @ViewChild('mainEditor') mainEditor!: ElementRef<HTMLDivElement>;
  @ViewChild('modalEditor') modalEditor!: ElementRef<HTMLDivElement>;
  availableNumbers: number[] = [1,2,3,4,5,6,7,8,9];
  numerosReservadosByRaffle: Record<number, number[]> = {};


// Mapa de participantes por rifa
participantesPorRifa: { [raffleId: number]: Participante[] } = {};
// Mapa de números reservados por rifa
numerosReservadosPorRifa: { [raffleId: number]: number[] } = {};

availableNumbersMap: { [raffleId: number]: number[] } = {};


  showCountdown: boolean = false;
expiryDate!: Date;

  selectedRaffleId: number | null = null;
  participantesPorMisRifas: Record<number, Participante[]> = {};
  participantsByRaffle = new Map<number, Participante[]>();
  cantidadRifasPermitidas:any
  countdownValue: number | null = null;
  mostrarVideo: boolean = false;

 // imagenes = ['10.jpg', '15.jpg', '30.jpg'];

imagenes = [
  { id: '5', src: '5.png', rifas: 5 },
  { id: '10', src: '101.png', rifas: 10 },
  { id: '15', src: '150.png', rifas: 15 }
];


 // imagenSeleccionada: string = '';
  imagenSeleccionada: any = this.imagenes[0];
  activeIndex: number = 0;
  private countdownInterval: any;
  juegoResponsableVisible:boolean = false;
  initialCantidadRifas = 1;

  isWalletOpen: { [key: number]: boolean } = {};

  constructor(
    private authService: AuthenticationService,
    private cdRef: ChangeDetectorRef,
    private router:Router,
    private raffleService: RaffleService,
    private messageService: MessageService,
    private participanteService: ParticipanteService,
    private codigoVipService: CodigoVipServiceService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private raffleExecutionService: RaffleExecutionService,
    private webSocketService: WebSocketService

  ){

  }


  ngOnInit(): void {
    window.addEventListener('storage', this.onStorageEvent.bind(this));
    this.loadUserId()

    this.initIndexedDB().catch(error => {
      console.error('❌ Error al inicializar IndexedDB, continuando sin almacenamiento local:', error);
    });

    const primerInicioSesion = JSON.parse(localStorage.getItem('primerInicioSesion') || 'false');

    if (primerInicioSesion) {
      this.mostrarVideo = true;

      // 🔥 Después de mostrar el video una vez, actualizamos `localStorage` para futuras sesiones.
      localStorage.setItem('primerInicioSesion', JSON.stringify(false));
    }

    this.loadWinningInfo();
   // this.loadWinningEntries();
  this.listenForRaffleExecution();



    this.activeRaffles = this.activeRaffles.map(raffle => {
      raffle.producto.descripcion = this.sanitizer.bypassSecurityTrustHtml(raffle.producto.descripcion) as unknown as string;
      return raffle;
    });


   this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
   this.userName = this.currentUser.name || 'Usuario';


   if (this.currentUser && this.currentUser.fechaRegistro) {
    const registrationDate = new Date(this.currentUser.fechaRegistro);
    // Calcula la fecha de expiración sumando 30 días
    const expiryDate = new Date(registrationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    this.startCountdown(expiryDate);
  } else {
    // Si no hay fecha de registro, asume que la cuenta ha expirado
    this.remainingTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }






  setInterval(() => {
    this.checkRifasParaAutoEjecutar();
  }, 60000); // 60000 ms = 1 minuto
  // Opcional: llámalo una vez al inicio:
  this.checkRifasParaAutoEjecutar();

  setInterval(() => {
    console.log('⏰ Trigger revisión automática de rifas caducadas');
    this.autoDeleteExpiredEmptyRaffles();
  }, 360000);



this.loadCurrentUserData();

    // Detecta si viene de pago exitoso (success URL de MP)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('payment_id');
    if (paymentId) {
      console.log('Pago exitoso detectado - payment_id:', paymentId);
      this.handleSuccessfulPayment();
    }

}


private loadCurrentUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isVip = currentUser.esVip || false;
      this.cantidadRifasPermitidas = currentUser.cantidadRifas || 1;
      console.log('Usuario cargado - VIP:', this.isVip, 'Rifas:', this.cantidadRifasPermitidas, 'id del usuario:', currentUser.id);
    }
  }

  private handleSuccessfulPayment(): void {
    Swal.fire({
      title: '¡Pago Exitoso!',
      text: 'Tu código VIP ha sido activado. ¡Ahora eres VIP!',
      icon: 'success',
      timer: 4000
    });

    // Recarga usuario del backend para activar VIP
    if (this.userId) {
      this.authService.getUserById(this.userId).subscribe({
        next: (usuarioActualizado) => {
          this.actualizarDatosUsuario(usuarioActualizado);
          this.loadUserRaffles(); // Recarga tus rifas
        },
        error: (err) => {
          console.error('Error recargando usuario post-pago:', err);
        }
      });
    }
  }

private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RaffleDB', 1);

      request.onupgradeneeded = (event: any) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        if (!this.db.objectStoreNames.contains('images')) {
          this.db.createObjectStore('images', { keyPath: 'productId' });
        }
        console.log('📦 IndexedDB actualizado/creado');
      };

      request.onsuccess = (event: any) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('✅ IndexedDB conectado');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Error al conectar IndexedDB');
        reject();
      };
    });
  }


  ocultarVideo(): void {
    this.mostrarVideo = false;
  }

private onStorageEvent(event: StorageEvent) {
  if (event.key === 'participantsUpdated') {
    console.log('🎉 Detectada nueva reserva en componente externo, recargando participantes…');
    this.loadAllParticipantsForMyRaffles();
  }
}





loadWinningInfo0(): void {
  const storedData = localStorage.getItem('winningData');
  let data: any[] = [];
  if (storedData) {
    try {
      data = JSON.parse(storedData);
      if (!Array.isArray(data)) {
        data = [];
      }
    } catch (error) {
      console.error('Error al parsear winningData:', error);
      data = [];
    }
  }
  this.winningData = data;
  console.log('Información de ganadores cargada:', this.winningData);
}


loadWinningInfo(): void {
  this.raffleService.getAllWinners().subscribe({
    next: (winningData) => {
      this.winningData = winningData;
      console.log('📡 Información de ganadores obtenida desde el backend:', this.winningData);
    },
    error: (error) => {
      console.error('❌ Error al obtener información de ganadores:', error);
      this.winningData = [];
    }
  });
}



/*
getWinningEntry0(raffleId: number): WinningEntry | undefined {
  return this.winningData.find(entry => entry.raffleId === raffleId);
}*/


getWinningEntry0(raffleId: number): WinningEntry | undefined {
  console.log("📡 Buscando ganador para la rifa ID:", raffleId);
  console.log("📊 Estado actual de winningData:", JSON.stringify(this.winningData, null, 2));

  const foundEntry = this.winningData.find(entry => entry.rifa.id === raffleId);

  if (!foundEntry) {
    console.log("❌ No se encontró una entrada ganadora para la rifa ID:", raffleId);
    return undefined;
  }

  console.log("✅ Entrada ganadora encontrada:", foundEntry);
  return foundEntry;
}

getWinningEntry(raffleId: number): WinningEntry | undefined {
 // console.log("📡 Buscando ganador para la rifa ID:", raffleId);
  //console.log("📊 Estado actual de winningData:", JSON.stringify(this.winningData, null, 2));

  // 🔥 Buscar la entrada correcta en winningData
  const foundEntry = this.winningData.find(entry => entry.rifa.id === raffleId);

  if (!foundEntry) {
    console.log("❌ No se encontró un ganador para la rifa ID:", raffleId);
    return undefined;
  }

 // console.log("✅ Entrada ganadora encontrada:", foundEntry);

  // 🔥 Formatear la respuesta en el formato correcto
  return {
    rifa: foundEntry.rifa,
    ganador: foundEntry.ganador,
    participantes: foundEntry.participantes
  };
}


loadWinningEntries(): void {
  this.completedRaffles.forEach(raffle => {
    const winnerEntry = this.getWinningEntry(raffle.id);
    if (winnerEntry) {
      this.winningEntries.set(raffle.id, winnerEntry);
    }
  });

  console.log("✅ Datos de ganadores almacenados:", this.winningEntries);
}





getActions(raffle: Raffle) {
  return [
    {
      label: 'Compartir',
      icon: 'pi pi-external-link',
      command: () => {
        //this.shareOnWhatsApp();
        this.shareRaffleOnWhatsApp(raffle)
      }
    },
    {
      label: 'Ejecutar Sorteo',
      icon: 'pi pi-play',
      command: (event: any) => {
        console.log('Ejecutar Sorteo callback invocado para la rifa:', raffle);
        this.executeRaffle(null, raffle);

      }
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: () => {
        this.deleteRaffle(raffle);
      }
    },
    {
      label: 'Ver Participantes',
      icon: 'pi pi-users',
      command: () => {
        if (raffle.id) { this.mostrarParticipantes(raffle.id); }
      }
    },
    {
      label: 'Ver Banner',
      icon: 'pi pi-eye',
      command: () => {
        this.openBanner(raffle);
      }
    }
  ];
}


getActions1(raffle: Raffle) {
  return [
    {
      label: 'Compartir',
      icon: 'pi pi-external-link',
      command: () => {
        //this.shareOnWhatsApp();
        this.shareWinnerOnWhatsApp(raffle.id!);
      }
    },

    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: () => {
        this.deleteRaffle(raffle);
      }
    },

    {
      label: 'Ver Participantes',
      icon: 'pi pi-users',
      command: () => {
        if (raffle.id) { this.mostrarParticipantesTerminados(raffle.id); }
      }
    },

  ];
}

openFormatDialog(): void {
  this.displayFormatDialog = true;
  setTimeout(() => {
    if (this.modalEditor && this.mainEditor) {
      this.modalEditor.nativeElement.innerHTML = this.mainEditor.nativeElement.innerHTML;
      console.log("Contenido cargado en el modal editor:", this.modalEditor.nativeElement.innerHTML);
    }
  }, 300);
}



applyFormat(command: string, value?: any): void {
  this.modalEditor.nativeElement.focus();
  document.execCommand(command, false, value || null);
}


applyFont(): void {
  this.applyFormat('fontName', this.selectedFont);
}


applyFontSize(): void {
  this.applyFormat('fontSize', this.selectedFontSize);
}


applyTextColor(): void {
  this.applyFormat('foreColor', this.textColor);
}



   closeFormatDialog1(applyChanges: boolean): void {
    if (applyChanges && this.modalEditor && this.mainEditor) {
      const newContent = this.modalEditor.nativeElement.innerHTML;
      this.mainEditor.nativeElement.innerHTML = newContent;
      this.productData.descripcion = newContent;
      this.descripcionInvalida = newContent.length > 1500;
    }
    this.displayFormatDialog = false;
  }

  closeFormatDialog(applyChanges: boolean): void {
    if (applyChanges && this.modalEditor && this.mainEditor) {
      const newContent = this.modalEditor.nativeElement.innerHTML;
      this.mainEditor.nativeElement.innerHTML = newContent;
      this.productData.descripcion = newContent;
      this.descripcionInvalida = newContent.length === 0 || newContent.length > 1500;
      console.log("Contenido final en el modal editor:", newContent);
      console.log("Descripción actualizada:", this.productData.descripcion);
    } else {
      console.log("Cambios descartados");
    }
    this.displayFormatDialog = false;
  }

  updateDescription(): void {
    // Actualiza productData.descripcion con el contenido HTML del editor
    const content = this.mainEditor.nativeElement.innerHTML.trim();
    this.productData.descripcion = content;
    // Valida: se considera inválida si está vacía o supera 1500 caracteres
    this.descripcionInvalida = content.length === 0 || content.length > 1500;
    console.log("Descripción actualizada:", this.productData.descripcion);
  }





startCountdown0(expiryDate: Date): void {
  this.timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = expiryDate.getTime() - now;

    if (distance <= 0) {
      // Si se acaba el tiempo, detener el cronómetro y poner todo en 0
      this.remainingTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      clearInterval(this.timerInterval);
    } else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      this.remainingTime = { days, hours, minutes, seconds };
    }
  }, 1000);


  }

private startCountdown(expiryDate: Date): void {
    // Limpia cualquier intervalo previo para evitar duplicados
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryDate.getTime() - now;

      if (distance <= 0) {
        this.remainingTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        clearInterval(this.countdownInterval);
      } else {
        this.remainingTime = {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        };
      }
      this.cdRef.detectChanges();
    }, 1000);
  }


  openBanner(raffle: Raffle): void {
    this.selectedRaffle = raffle;

    if (this.raffleBannerComponent) {
      this.raffleBannerComponent.raffle = raffle;
      this.raffleBannerComponent.openBanner();
    }
  }

   // 🔹 Método para descargar la imagen
   downloadImage(): void {
    if (!this.imageDataUrl) {
      console.error('No hay imagen disponible para descargar');
      return;
    }

    const link = document.createElement('a');
    link.href = this.imageDataUrl;
    link.download = 'raffle-banner.png';
    link.click();
  }

  downloadBannerImage(): void {
    if (this.raffleBannerComponent) {
      this.raffleBannerComponent.downloadImage();
    } else {
      console.error('No se encontró el componente del banner');
    }
  }






    logout0(): void {
      this.sidebarVisible = false;
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Quieres cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'No, permanecer'
      }).then((result) => {
        if (result.isConfirmed) {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

          // Guardar la cantidad de rifas antes de limpiar el localStorage
          let rifasGuardadas = null;
          if (currentUser && currentUser.id) {
            rifasGuardadas = localStorage.getItem(`rifas_${currentUser.id}`);
          }

          // Cerrar sesión y limpiar localStorage
          this.authService.logout();
          localStorage.clear();

          // Restaurar la cantidad de rifas si existía
          if (currentUser && currentUser.id && rifasGuardadas) {
            localStorage.setItem(`rifas_${currentUser.id}`, rifasGuardadas);
          }

          this.router.navigate(['/login']);
          Swal.fire('¡Cerrado!', 'Tu sesión ha sido cerrada', 'success');
        }
      });
    }

    logout(): void {
      this.sidebarVisible = false;
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Quieres cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'No, permanecer'
      }).then((result) => {
        if (result.isConfirmed) {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

          // Si es VIP, guarda sus datos VIP persistentes
          if (currentUser && currentUser.esVip && currentUser.id) {
            const datosVip = {
              esVip: currentUser.esVip,
              codigoVip: currentUser.codigoVip,
              cantidadRifas: currentUser.cantidadRifas,
            };
            localStorage.setItem(`vip_${currentUser.id}`, JSON.stringify(datosVip));
          }

          // Limpiar solo currentUser (y otros datos de sesión si es necesario)
          this.authService.logout();
          localStorage.removeItem('currentUser');
          // O remove cualquier otro token si lo estás usando

          this.router.navigate(['/login']);
          Swal.fire('¡Cerrado!', 'Tu sesión ha sido cerrada', 'success');
        }
      });
    }








loadUserId0(): void {
  let currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) {
    console.error("❌ No se encontró el usuario logueado en localStorage.");
    return;
  }

  const currentUser = JSON.parse(currentUserRaw);
  this.userId = currentUser.id;
  console.log('id del usuario', currentUser.id)

  if (!this.userId) {
    console.error("❌ No se pudo obtener el ID del usuario.");
    return;
  }

  // 🔥 🚀 Obtener datos actualizados desde el backend
  this.raffleService.obtenerUsuarioPorId(this.userId).subscribe({
    next: (usuarioActualizado) => {
      // 🔥 Actualizamos localStorage y variables de sesión
      localStorage.setItem('currentUser', JSON.stringify(usuarioActualizado));
      this.actualizarDatosUsuario(usuarioActualizado);

      // 🔥 Cargar rifas del usuario después de actualizarlo
      this.loadUserRaffles();
    },
    error: (error) => {
      console.error("❌ Error al obtener el usuario:", error);
    }
  });
}


loadUserId(): void {
  let currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) {
    console.error("❌ No se encontró el usuario logueado en localStorage.");
    return;
  }

  const currentUser = JSON.parse(currentUserRaw);
  this.userId = currentUser.id;
  console.log('id del usuario', currentUser.id);

  if (!this.userId) {
    console.error("❌ No se pudo obtener el ID del usuario.");
    return;
  }

  // 🔥 🚀 Intentar obtener datos actualizados desde el backend
  this.raffleService.obtenerUsuarioPorId(this.userId).subscribe({
    next: (usuarioActualizado) => {
      // 🔥 Actualizamos localStorage y variables de sesión
      localStorage.setItem('currentUser', JSON.stringify(usuarioActualizado));
      this.actualizarDatosUsuario(usuarioActualizado);

      // 🔥 Cargar rifas del usuario después de actualizarlo
      this.loadUserRaffles();
    },
    error: (error) => {
      console.error("❌ Error al obtener el usuario:", error);
      // Fallback: Usar datos de localStorage y cargar rifas
      this.actualizarDatosUsuario(currentUser); // Usar datos iniciales como fallback
      this.loadUserRaffles(); // Cargar rifas con el userId existente
    },
    complete: () => {
      console.log("🔍 Proceso de carga de usuario completado.");
    }
  });
}





  loadUserRaffles1(): void {
  if (!this.userId) {
    console.error("❌ El userId no está definido.");
    return;
  }

  this.raffleService.getRafflesByUser(this.userId).subscribe({
    next: (raffles: Raffle[]) => {
      if (!raffles || raffles.length === 0) {
        console.warn("⚠️ No se encontraron rifas asociadas al usuario.");
      } else {
        console.log("✅ Rifas obtenidas:", raffles);
      }

      this.userRaffles = raffles;
      this.updateRafflesByStatus();
      this.loadAllParticipantsForMyRaffles();

      this.userRaffles.forEach(raffle => {
        if (!raffle.producto.imagenes || raffle.producto.imagenes.length === 0) {
          raffle.producto.imagenes = ['assets/images/default.jpg'];
        }
      });

      if (this.userRaffles.length > 0) {
        this.newlyCreatedRaffle = this.userRaffles[0];
      }

      console.log('🆕 Rifas cargadas:', this.userRaffles);
    },
    error: (error) => {
      console.error('❌ Error al cargar las rifas:', error);
    }
  });
}

loadUserRaffles0(): void {
  if (!this.userId) {
    console.error("❌ El userId no está definido.");
    return;
  }

  const localKey = `raffles_${this.userId}`;
  const localRaffles = localStorage.getItem(localKey);

  if (localRaffles) {
    // 🔥 Cargar desde localStorage si existe
    this.userRaffles = JSON.parse(localRaffles);
    console.log("✅ Rifas cargadas desde localStorage:", this.userRaffles);
    this.updateRafflesByStatus();
    this.loadAllParticipantsForMyRaffles();

    this.userRaffles.forEach(raffle => {
      if (!raffle.producto.imagenes || raffle.producto.imagenes.length === 0) {
        raffle.producto.imagenes = ['assets/images/default.jpg'];
      }
    });

    if (this.userRaffles.length > 0) {
      this.newlyCreatedRaffle = this.userRaffles[0];
    }

    console.log('🆕 Rifas cargadas desde localStorage:', this.userRaffles);
  } else {
    // 🔥 Cargar desde backend si no hay en localStorage
    this.raffleService.getRafflesByUser(this.userId).subscribe({
      next: (raffles: Raffle[]) => {
        if (!raffles || raffles.length === 0) {
          console.warn("⚠️ No se encontraron rifas asociadas al usuario.");
        } else {
          console.log("✅ Rifas obtenidas del backend:", raffles);
        }

        this.userRaffles = raffles;
        // 🔥 Guardar en localStorage para futuras cargas
        localStorage.setItem(localKey, JSON.stringify(this.userRaffles));
        this.updateRafflesByStatus();
        this.loadAllParticipantsForMyRaffles();

        this.userRaffles.forEach(raffle => {
          if (!raffle.producto.imagenes || raffle.producto.imagenes.length === 0) {
            raffle.producto.imagenes = ['assets/images/default.jpg'];
          }
        });

        if (this.userRaffles.length > 0) {
          this.newlyCreatedRaffle = this.userRaffles[0];
        }

        console.log('🆕 Rifas cargadas del backend y guardadas en localStorage:', this.userRaffles);
      },
      error: (error) => {
        console.error('❌ Error al cargar las rifas:', error);
      }
    });
  }
}

loadUserRaffles2(): void {
  if (!this.userId) {
    console.error('❌ El userId no está definido.');
    return;
  }

  const localKey = `raffles_${this.userId}`;
  const localRaffles = localStorage.getItem(localKey);

  const processRaffles = (raffles: Raffle[]) => {
    this.userRaffles = raffles;
    this.updateRafflesByStatus();
    this.loadAllParticipantsForMyRaffles();
    raffles.forEach(raffle => {
      if (!raffle.producto.imagenes?.length) {
        raffle.producto.imagenes = ['assets/images/default.jpg'];
      } else if (raffle.producto.id) { // Validar que id no sea undefined
        this.loadImagesFromIndexedDB(raffle.producto.id, raffle.producto.imagenes);
      } else {
        console.warn(`⚠️ ID de producto no definido para la rifa ${raffle.id}, usando URLs del backend`);
      }
    });
    if (this.userRaffles.length > 0) this.newlyCreatedRaffle = this.userRaffles[0];
    console.log('🆕 Rifas cargadas:', this.userRaffles);
  };

  if (localRaffles) {
    processRaffles(JSON.parse(localRaffles));
  } else {
    this.raffleService.getRafflesByUser(this.userId).subscribe({
      next: (raffles: Raffle[]) => {
        if (!raffles?.length) console.warn('⚠️ No se encontraron rifas asociadas al usuario.');
        else console.log('✅ Rifas obtenidas del backend:', raffles);
        this.userRaffles = raffles;
        localStorage.setItem(localKey, JSON.stringify(raffles));
        processRaffles(raffles);
      },
      error: (error) => {
        console.error('❌ Error al cargar las rifas:', error);
        if (localRaffles) {
          console.warn('⚠️ Usando datos de localStorage como fallback.');
          processRaffles(JSON.parse(localRaffles));
        }
      }
    });
  }
}

loadUserRaffles3(): void {
  if (!this.userId) {
    console.error('❌ El userId no está definido.');
    return;
  }

  const localKey = `raffles_${this.userId}`;
  const localRaffles = localStorage.getItem(localKey);

  const processRaffles = (raffles: Raffle[]) => {
    this.userRaffles = raffles;
    this.updateRafflesByStatus();
    this.loadAllParticipantsForMyRaffles();
    raffles.forEach(raffle => {
      if (!raffle.producto.imagenes?.length) {
        raffle.producto.imagenes = ['assets/images/default.jpg'];
      } else if (raffle.producto.id) {
        const productKey = `product_${raffle.producto.id}_images`;
        const localImages = JSON.parse(localStorage.getItem(productKey) || '{}');
        if (Object.keys(localImages).length > 0) {
          raffle.producto.imagenes = Object.values(localImages).map((base64: any) => base64); // Carga base64
          console.log(`🖼️ Imágenes cargadas desde localStorage como base64 para productId ${raffle.producto.id}:`, raffle.producto.imagenes);
        } else {
          console.log(`ℹ️ No se encontraron imágenes en localStorage para productId ${raffle.producto.id}, usando URLs del backend`);
        }
      } else {
        console.warn(`⚠️ ID de producto no definido para la rifa ${raffle.id}, usando URLs del backend`);
      }
    });
    if (this.userRaffles.length > 0) this.newlyCreatedRaffle = this.userRaffles[0];
    console.log('🆕 Rifas cargadas:', this.userRaffles);
  };

  if (localRaffles) {
    processRaffles(JSON.parse(localRaffles));
  } else {
    this.raffleService.getRafflesByUser(this.userId).subscribe({
      next: (raffles: Raffle[]) => {
        if (!raffles?.length) console.warn('⚠️ No se encontraron rifas asociadas al usuario.');
        else console.log('✅ Rifas obtenidas del backend:', raffles);
        this.userRaffles = raffles;
        localStorage.setItem(localKey, JSON.stringify(raffles));
        processRaffles(raffles);
      },
      error: (error) => {
        console.error('❌ Error al cargar las rifas:', error);
        if (localRaffles) {
          console.warn('⚠️ Usando datos de localStorage como fallback.');
          processRaffles(JSON.parse(localRaffles));
        }
      }
    });
  }
}

loadUserRaffles00(): void {
  if (!this.userId) {
    console.error('❌ El userId no está definido.');
    return;
  }

  const localKey = `raffles_${this.userId}`;
  const localRaffles = localStorage.getItem(localKey);

  // Siempre verifica contra el backend para limpiar eliminadas
  this.raffleService.getRafflesByUser(this.userId).subscribe({
    next: (backendRaffles: Raffle[]) => {
      if (!backendRaffles?.length) {
        console.warn('⚠️ No se encontraron rifas asociadas al usuario.');
        this.userRaffles = [];
        localStorage.setItem(localKey, JSON.stringify([])); // Limpia localStorage si vacío
      } else {
        console.log('✅ Rifas obtenidas del backend:', backendRaffles);

        // Si hay localStorage, filtra solo rifas válidas (elimina fantasmas)
        let validRaffles = backendRaffles;
        if (localRaffles) {
          const localRafflesParsed = JSON.parse(localRaffles);
          const backendIds = new Set(backendRaffles.map(r => r.id));
          validRaffles = localRafflesParsed.filter((r: Raffle) => backendIds.has(r.id));
          if (validRaffles.length < localRafflesParsed.length) {
            console.log(`🗑️ Limpiando ${localRafflesParsed.length - validRaffles.length} rifas eliminadas de localStorage`);
          }
        }

        this.userRaffles = validRaffles;
        localStorage.setItem(localKey, JSON.stringify(validRaffles)); // Sobrescribe con datos limpios
        this.updateRafflesByStatus();
        this.loadAllParticipantsForMyRaffles();

        this.userRaffles.forEach(raffle => {
          if (!raffle.producto.imagenes?.length) {
            raffle.producto.imagenes = ['assets/images/default.jpg'];
          }
        });

        if (this.userRaffles.length > 0) this.newlyCreatedRaffle = this.userRaffles[0];
        console.log('🆕 Rifas cargadas y sincronizadas:', this.userRaffles);
      }
    },
    error: (error) => {
      console.error('❌ Error al sincronizar rifas del backend:', error);
      // Fallback: Usa localStorage si backend falla
      if (localRaffles) {
        this.userRaffles = JSON.parse(localRaffles);
        this.updateRafflesByStatus();
        this.loadAllParticipantsForMyRaffles();
        console.warn('⚠️ Usando datos de localStorage como fallback.');
      }
    }
  });
}

loadUserRaffles001(): void {
  if (!this.userId) {
    console.error('❌ El userId no está definido.');
    return;
  }

  const localKey = `raffles_${this.userId}`;
  const localRaffles = localStorage.getItem(localKey);

  // Siempre verifica contra el backend para limpiar eliminadas
  this.raffleService.getRafflesByUser(this.userId).subscribe({
    next: (backendRaffles: Raffle[]) => {
      if (!backendRaffles?.length) {
        console.warn('⚠️ No se encontraron rifas asociadas al usuario.');
        this.userRaffles = [];
        localStorage.setItem(localKey, JSON.stringify([]));
      } else {
        console.log('✅ Rifas obtenidas del backend:', backendRaffles);

        // 🔥 Filtra solo rifas del código VIP actual (independiente de anteriores)
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const currentCodigoVip = currentUser.codigoVip || '';
        let validRaffles = backendRaffles.filter(r => r.codigoVipUsado === currentCodigoVip); // Solo rifas del código actual

        // Si hay localStorage, filtra fantasmas
        if (localRaffles) {
          const localRafflesParsed = JSON.parse(localRaffles);
          const backendIds = new Set(validRaffles.map(r => r.id));
          validRaffles = localRafflesParsed.filter((r: Raffle) => backendIds.has(r.id) && r.codigoVipUsado === currentCodigoVip);
          if (validRaffles.length < localRafflesParsed.length) {
            console.log(`🗑️ Limpiando rifas eliminadas de localStorage`);
          }
        }

        this.userRaffles = validRaffles;
        localStorage.setItem(localKey, JSON.stringify(validRaffles)); // Sobrescribe con filtradas
        console.log('Rifas filtradas por código actual:', this.userRaffles.length);

        this.updateRafflesByStatus();
        this.loadAllParticipantsForMyRaffles();

        this.userRaffles.forEach(raffle => {
          if (!raffle.producto.imagenes?.length) {
            raffle.producto.imagenes = ['assets/images/default.jpg'];
          }
        });

        if (this.userRaffles.length > 0) this.newlyCreatedRaffle = this.userRaffles[0];
        console.log('🆕 Rifas cargadas y sincronizadas (filtradas):', this.userRaffles);
      }
    },
    error: (error) => {
      console.error('❌ Error al sincronizar rifas del backend:', error);
      // Fallback: Usa localStorage filtrado por código actual
      if (localRaffles) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const currentCodigoVip = currentUser.codigoVip || '';
        const localRafflesParsed = JSON.parse(localRaffles);
        this.userRaffles = localRafflesParsed.filter((r: Raffle) => r.codigoVipUsado === currentCodigoVip);
        this.updateRafflesByStatus();
        this.loadAllParticipantsForMyRaffles();
        console.warn('⚠️ Usando datos de localStorage como fallback (filtrado por código).');
      }
    }
  });
}

loadUserRaffles(): void {
  if (!this.userId) {
    console.error('❌ El userId no está definido.');
    return;
  }

  const localKey = `raffles_${this.userId}`;
  const localRaffles = localStorage.getItem(localKey);

  // Siempre verifica contra el backend para limpiar eliminadas
  this.raffleService.getRafflesByUser(this.userId).subscribe({
    next: (backendRaffles: Raffle[]) => {
      if (!backendRaffles?.length) {
        console.warn('⚠️ No se encontraron rifas asociadas al usuario.');
        this.userRaffles = [];
        localStorage.setItem(localKey, JSON.stringify([]));
      } else {
        console.log('✅ Rifas obtenidas del backend:', backendRaffles);

        // 🔥 Filtra solo rifas del código VIP actual (maneja null para rifas antiguas/no VIP)
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const currentCodigoVip = currentUser.codigoVip || '';
        let validRaffles = backendRaffles.filter(r => {
          // Si rifa tiene código usado y coincide con actual, incluir
          if (r.codigoVipUsado && r.codigoVipUsado === currentCodigoVip) {
            return true;
          }
          // Si rifa antigua/no VIP (null), incluir siempre para display histórico
          return !r.codigoVipUsado; // Incluye null (históricas)
        });

        // Si hay localStorage, filtra fantasmas
        if (localRaffles) {
          const localRafflesParsed = JSON.parse(localRaffles);
          const backendIds = new Set(validRaffles.map(r => r.id));
          validRaffles = localRafflesParsed.filter((r: Raffle) => backendIds.has(r.id) &&
            (r.codigoVipUsado === currentCodigoVip || !r.codigoVipUsado) // Maneja null
          );
          if (validRaffles.length < localRafflesParsed.length) {
            console.log(`🗑️ Limpiando rifas eliminadas de localStorage`);
          }
        }

        this.userRaffles = validRaffles;
        localStorage.setItem(localKey, JSON.stringify(validRaffles)); // Sobrescribe con filtradas
        console.log('Rifas filtradas por código actual (manejo null):', this.userRaffles.length);

        this.updateRafflesByStatus();
        this.loadAllParticipantsForMyRaffles();

        this.userRaffles.forEach(raffle => {
          if (!raffle.producto.imagenes?.length) {
            raffle.producto.imagenes = ['assets/images/default.jpg'];
          }
        });

        if (this.userRaffles.length > 0) this.newlyCreatedRaffle = this.userRaffles[0];
        console.log('🆕 Rifas cargadas y sincronizadas (filtradas):', this.userRaffles);
      }
    },
    error: (error) => {
      console.error('❌ Error al sincronizar rifas del backend:', error);
      // Fallback: Usa localStorage filtrado por código actual (manejo null)
      if (localRaffles) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const currentCodigoVip = currentUser.codigoVip || '';
        const localRafflesParsed = JSON.parse(localRaffles);
        this.userRaffles = localRafflesParsed.filter((r: Raffle) => {
          if (r.codigoVipUsado && r.codigoVipUsado === currentCodigoVip) {
            return true;
          }
          return !r.codigoVipUsado; // Incluye null (históricas)
        });
        this.updateRafflesByStatus();
        this.loadAllParticipantsForMyRaffles();
        console.warn('⚠️ Usando datos de localStorage como fallback (filtrado por código, manejo null).');
      }
    }
  });
}


private loadImagesFromIndexedDB1(productId: number, imageUrls: string[]): void {
  if (!this.db) {
    console.warn('⚠️ IndexedDB no inicializado, usando URLs del backend');
    return;
  }

  if (isNaN(productId)) {
    console.error('❌ productId no es un número válido:', productId);
    return;
  }

  const transaction = this.db.transaction(['images'], 'readonly');
  const store = transaction.objectStore('images');
  const request = store.get(productId);

  request.onsuccess = (event: any) => {
    const data = event.target.result;
    if (data) {
      const blob = data.blob;
      const url = URL.createObjectURL(blob);
      imageUrls[data.slot] = url; // Reemplaza la URL del backend con la local
      console.log(`🖼️ Imagen cargada desde IndexedDB para productId ${productId}, slot ${data.slot}`);
    } else {
      console.log(`ℹ️ No se encontró imagen en IndexedDB para productId ${productId}, usando URL del backend`);
    }
  };

  request.onerror = () => console.error(`❌ Error al cargar imagen desde IndexedDB para productId ${productId}`);
}

private loadImagesFromIndexedDB(productId: number, imageUrls: string[]): void {
  if (!this.db) {
    console.warn('⚠️ IndexedDB no inicializado, usando URLs del backend');
    return;
  }

  if (isNaN(productId)) {
    console.error('❌ productId no es un número válido:', productId);
    return;
  }

  const transaction = this.db.transaction(['images'], 'readonly');
  const store = transaction.objectStore('images');
  const request = store.get(productId);

  request.onsuccess = (event: any) => {
    const data = event.target.result;
    if (data && data.images) {
      data.images.forEach((img: { blob: Blob; slot: number }, slotIndex: number) => {
        if (img.blob) {
          const url = URL.createObjectURL(img.blob);
          imageUrls[slotIndex] = url;
          console.log(`🖼️ Imagen cargada desde IndexedDB para productId ${productId}, slot ${slotIndex}`);
        }
      });
    } else {
      console.log(`ℹ️ No se encontraron imágenes en IndexedDB para productId ${productId}, usando URLs del backend`);
    }
  };

  request.onerror = () => console.error(`❌ Error al cargar imágenes desde IndexedDB para productId ${productId}`);
}


 // Validar y asignar código VIP

validarYAsignarCodigoVip0(): void {
  if (!this.codigoVip.trim()) {
    this.mostrarMensaje('error', 'Código VIP requerido', 'Por favor, ingrese un código VIP.');
    return;
  }

  const userId = this.userId;
  if (!userId) {
    this.mostrarMensaje('error', 'Usuario no identificado', 'No se ha encontrado información del usuario.');
    return;
  }

  this.raffleService.activarVip(userId, this.codigoVip.trim()).subscribe({
    next: (usuarioActualizado) => {
      console.log('✅ Usuario actualizado:', usuarioActualizado);
      console.log('Cantidad rifas del backend:', usuarioActualizado.cantidadRifas);
      // Actualizar variables del usuario en el frontend
      this.actualizarDatosUsuario(usuarioActualizado);
      this.sidebarVisible = false
      this.mostrarMensaje('success', '¡VIP activado!', `Ahora puedes crear ${usuarioActualizado.cantidadRifas} rifas.`);
    },
    error: (error) => {
      console.error('❌ Error al activar VIP:', error);
      this.mostrarMensaje('error', 'Error en la activación', error.message || 'No se pudo activar el VIP.');
    }
  });

  this.hideProductDialog();


}


validarYAsignarCodigoVip1(): void {
  if (!this.codigoVip.trim()) {
    this.mostrarMensaje('error', 'Código VIP requerido', 'Por favor, ingrese un código VIP.');
    return;
  }

  const userId = this.userId;
  if (!userId) {
    this.mostrarMensaje('error', 'Usuario no identificado', 'No se ha encontrado información del usuario.');
    return;
  }

  this.raffleService.activarVip(userId, this.codigoVip.trim()).subscribe({
    next: (usuarioActualizado) => {
      console.log('✅ Usuario actualizado del backend:', usuarioActualizado);
      console.log('Cantidad rifas del backend:', usuarioActualizado.cantidadRifas); // Log para depurar

      // Actualizar variables del usuario en el frontend
      this.actualizarDatosUsuario(usuarioActualizado);

      // 🔥 Fuerza actualización de localStorage con el valor backend
      const currentUserRaw = localStorage.getItem('currentUser');
      if (currentUserRaw) {
        const currentUser = JSON.parse(currentUserRaw);
        currentUser.initialCantidadRifas = usuarioActualizado.cantidadRifas;
        currentUser.cantidadRifas = usuarioActualizado.cantidadRifas; // Fuerza el valor backend
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('localStorage actualizado con initialCantidadRifas =', currentUser.initialCantidadRifas);
        console.log('localStorage actualizado con cantidadRifas =', currentUser.cantidadRifas);
      }

      //this.loadUserRaffles();
      this.sidebarVisible = false;
      this.mostrarMensaje('success', '¡VIP activado!', `Ahora puedes crear ${usuarioActualizado.cantidadRifas} rifas.`);
    },
    error: (error) => {
      console.error('❌ Error al activar VIP:', error);
      this.mostrarMensaje('error', 'Error en la activación', error.message || 'No se pudo activar el VIP.');
    }
  });

  this.hideProductDialog();
}

validarYAsignarCodigoVip(): void {
  if (!this.codigoVip.trim()) {
    this.mostrarMensaje('error', 'Código VIP requerido', 'Por favor, ingrese un código VIP.');
    return;
  }

  const userId = this.userId;
  if (!userId) {
    this.mostrarMensaje('error', 'Usuario no identificado', 'No se ha encontrado información del usuario.');
    return;
  }

  this.raffleService.activarVip(userId, this.codigoVip.trim()).subscribe({
    next: (usuarioActualizado) => {
      console.log('✅ Usuario actualizado del backend:', usuarioActualizado);
      console.log('Cantidad rifas inicial del backend:', usuarioActualizado.cantidadRifas); // 10

      // Actualizar variables del usuario en el frontend
      this.actualizarDatosUsuario(usuarioActualizado);

      // 🔥 Guarda límite inicial fijo separado en localStorage
      this.initialCantidadRifas = usuarioActualizado.cantidadRifas;
      const vipInitialKey = `vipInitialLimit_${userId}`;
      localStorage.setItem(vipInitialKey, usuarioActualizado.cantidadRifas.toString()); // Fijo 10, no cambia
      localStorage.setItem(vipInitialKey, this.initialCantidadRifas.toString());
      console.log('localStorage vipInitialLimit guardado: 10 (fijo)');
      console.log('Propiedad initialCantidadRifas set a 10 (fijo), backup en localStorage', this.initialCantidadRifas);

      // Actualiza restantes en currentUser
      const currentUserRaw = localStorage.getItem('currentUser');
      if (currentUserRaw) {
        const currentUser = JSON.parse(currentUserRaw);
        currentUser.cantidadRifas = usuarioActualizado.cantidadRifas; // Inicial 10
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('localStorage cantidadRifas = 10 (inicial)');
      }

      // Recarga rifas
      this.loadUserRaffles();

      this.sidebarVisible = false;
      this.mostrarMensaje('success', '¡VIP activado!', `Ahora puedes crear ${usuarioActualizado.cantidadRifas} rifas.`);
    },
    error: (error) => {
      console.error('❌ Error al activar VIP:', error);
      this.mostrarMensaje('error', 'Error en la activación', error.message || 'No se pudo activar el VIP.');
    }
  });

  this.hideProductDialog();
}


private actualizarDatosUsuario1(usuarioActualizado: any): void {
  // Guardar usuario actualizado en localStorage
  localStorage.setItem('currentUser', JSON.stringify(usuarioActualizado));

  // Actualizar variables del frontend
  this.isVip = usuarioActualizado.esVip;
  this.cantidadRifasPermitidas = usuarioActualizado.cantidadRifas;
  this.codigoVip = usuarioActualizado.codigoVip;
  this.fechaRegistro = usuarioActualizado.fechaRegistro;

  console.log('🔹 Datos del usuario actualizados:', usuarioActualizado);

  this.cdRef.detectChanges(); // 🔥 Refrescar vista

}

private actualizarDatosUsuario0(usuarioActualizado: any): void {
  localStorage.setItem('currentUser', JSON.stringify(usuarioActualizado));

  this.isVip = usuarioActualizado.esVip;
  this.cantidadRifasPermitidas = usuarioActualizado.cantidadRifas;
  this.codigoVip = usuarioActualizado.codigoVip;
  this.fechaRegistro = usuarioActualizado.fechaRegistro; // 🔥 Guardamos la fecha nueva

  console.log('🔹 Datos del usuario actualizados:', usuarioActualizado);

  // 🔥 Actualizar fecha sin reiniciar el temporizador
  if (usuarioActualizado.fechaRegistro) {
    const nuevaFechaExpiracion = new Date(usuarioActualizado.fechaRegistro);
    this.expiryDate = nuevaFechaExpiracion; // 🔥 Solo cambiamos la fecha
  }

  this.cdRef.detectChanges(); // 🔥 Refrescar vista sin reiniciar nada
}

private actualizarDatosUsuario(usuarioActualizado: any): void {
    localStorage.setItem('currentUser', JSON.stringify(usuarioActualizado));
    this.isVip = usuarioActualizado.esVip;
    this.cantidadRifasPermitidas = usuarioActualizado.cantidadRifas;
    this.codigoVip = usuarioActualizado.codigoVip;
    // Convertir fechaRegistro de string ISO a Date
    this.fechaRegistro = usuarioActualizado.fechaRegistro ? new Date(usuarioActualizado.fechaRegistro) : null;
    console.log('🔹 Datos del usuario actualizados:', usuarioActualizado);

    // Reiniciar el contador con la nueva fecha
    if (this.fechaRegistro) {
      const expiryDate = new Date(this.fechaRegistro.getTime() + 30 * 24 * 60 * 60 * 1000);
      this.startCountdown(expiryDate);
    } else {
      this.remainingTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    this.cdRef.detectChanges();
  }



private asignarCodigoVip(cantidadRifas: number): void {
  console.log('Asignando código VIP con rifas:', cantidadRifas); // 🟢 Verifica el valor antes de guardar

  this.isVip = true;
  this.codigoVip = this.codigoVip!.trim();

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (currentUser && currentUser.id) {
    currentUser.esVip = true;
    currentUser.codigoVip = this.codigoVip;
    currentUser.cantidadRifas = cantidadRifas; // 🔴 Asegurar que se almacene correctamente


    console.log('Usuario actualizado antes de guardar en localStorage:', currentUser); // 🟢 Verificar que tiene cantidadRifas

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    this.userId = currentUser.id;
    this.cantidadRifas = cantidadRifas;


    this.mostrarMensaje('success', 'Código VIP asignado', `¡Felicidades! Ahora puede crear hasta ${cantidadRifas}! rifas ;).`);
    this.hideProductDialog();
    this.codigoVip = '';

    this.cdRef.detectChanges();
  } else {
    console.log('No se encontró el usuario en el localStorage.');
    this.mostrarMensaje('error', 'Error al asignar el código VIP', 'Hubo un error al actualizar el usuario.');
  }
}


private asignarCodigoVipAlUsuario1(cantidadRifas: number): void {
  const currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) {
    console.error('No hay usuario logueado en localStorage');
    return;
  }

  // 4. Parseamos y actualizamos el usuario
  const currentUser = JSON.parse(currentUserRaw);
  currentUser.esVip = true;
  currentUser.codigoVip = this.codigoVip.trim();
  currentUser.cantidadRifas = cantidadRifas;

  // 5. Guardamos el currentUser actualizado
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  // 6. Guardamos también un objeto VIP por separado para persistirlo incluso tras logout/clear()
  const vipData = {
    esVip: true,
    codigoVip: currentUser.codigoVip,
    cantidadRifas: cantidadRifas
  };
  localStorage.setItem(`vip_${currentUser.id}`, JSON.stringify(vipData));

  // 7. Refrescamos tus variables de componente
  this.isVip = true;
  this.cantidadRifasPermitidas = cantidadRifas;

  this.mostrarMensaje('success', '¡VIP activado!', `Ahora puede crear hasta ${cantidadRifas}! rifas ;)`);

  this.cdRef.detectChanges();
}


private asignarCodigoVipAlUsuario(cantidadRifas: number): void {
    const currentUserRaw = localStorage.getItem('currentUser');
    if (!currentUserRaw) {
      console.error('No hay usuario logueado en localStorage');
      return;
    }

    const currentUser = JSON.parse(currentUserRaw);
    currentUser.esVip = true;
    currentUser.codigoVip = this.codigoVip.trim();
    currentUser.cantidadRifas = cantidadRifas;

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const vipData = {
      esVip: true,
      codigoVip: currentUser.codigoVip,
      cantidadRifas: cantidadRifas
    };
    localStorage.setItem(`vip_${currentUser.id}`, JSON.stringify(vipData));

    this.isVip = true;
    this.cantidadRifasPermitidas = cantidadRifas;

    this.mostrarMensaje('success', '¡VIP activado!', `Ahora puede crear hasta ${cantidadRifas}! rifas ;)`);

    // Actualizar fechaRegistro y reiniciar contador
    currentUser.fechaRegistro = new Date().toISOString();
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    this.fechaRegistro = new Date(currentUser.fechaRegistro);
    const expiryDate = new Date(this.fechaRegistro.getTime() + 30 * 24 * 60 * 60 * 1000);
    this.startCountdown(expiryDate);

    this.cdRef.detectChanges();
  }






deleteRaffle0(raffle: Raffle): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la rifa y todos los datos relacionados (participantes, números reservados, imágenes). Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      // Primero eliminamos las imágenes asociadas a la rifa
      const imageDeletions = raffle.producto.imagenes.map(imageUrl => {
        const imageName = imageUrl.split('/').pop(); // Extrae el nombre de la imagen
        return this.raffleService.deleteImage(imageName!);
      });

      forkJoin(imageDeletions).subscribe({
        next: () => {
          // Luego, eliminamos la rifa del backend
          this.raffleService.deleteRaffle(raffle.id!).subscribe({
            next: () => {
              console.log('Rifa eliminada con éxito');

              // Eliminar la rifa de las listas locales
              this.activeRaffles = this.activeRaffles.filter(r => r.id !== raffle.id);
              this.completedRaffles = this.completedRaffles.filter(r => r.id !== raffle.id);

              // Eliminar datos relacionados en el localStorage
              this.removeRaffleDataFromLocalStorage(raffle.id!);

              // Recargar las rifas del usuario
              this.loadUserRaffles();

              Swal.fire({
                title: '¡Eliminada!',
                text: 'La rifa y todos los datos relacionados han sido eliminados correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
              });
            },
            error: (error) => {
              console.error('Error al eliminar la rifa:', error);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la rifa.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
              });
            }
          });
        },
        error: (error) => {
          console.error('Error al eliminar las imágenes:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar las imágenes.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      });
    }
  });
}

private removeRaffleDataFromLocalStorage0(raffleId: number): void {
  // Eliminar datos de ganadores relacionados con la rifa
  const storedData = localStorage.getItem('winningData');
  if (storedData) {
    try {
      let winningData = JSON.parse(storedData);
      if (Array.isArray(winningData)) {
        winningData = winningData.filter(entry => entry.raffleId !== raffleId);
        localStorage.setItem('winningData', JSON.stringify(winningData));
        console.log(`Datos de ganadores para la rifa ${raffleId} eliminados del localStorage.`);
      }
    } catch (error) {
      console.error('Error al parsear winningData:', error);
    }
  }

  // Eliminar cualquier otro dato relacionado con la rifa en el localStorage
  const raffleKey = `raffle_${raffleId}`;
  if (localStorage.getItem(raffleKey)) {
    localStorage.removeItem(raffleKey);
    console.log(`Datos específicos de la rifa ${raffleId} eliminados del localStorage.`);
  }
}

deleteRaffle1(raffle: Raffle): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la rifa y todos los datos relacionados. Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      const imageDeletions = raffle.producto.imagenes.map(imageUrl =>
        this.raffleService.deleteImage(imageUrl.split('/').pop()!)
      );

      forkJoin(imageDeletions).pipe(
        switchMap(() => this.raffleService.deleteRaffle(raffle.id!))
      ).subscribe({
        next: () => {
          console.log('Rifa eliminada con éxito');
          this.removeRaffleDataFromLocalStorage(raffle.id!); // Eliminar datos locales, incluyendo imágenes
          this.activeRaffles = this.activeRaffles.filter(r => r.id !== raffle.id);
          this.completedRaffles = this.completedRaffles.filter(r => r.id !== raffle.id);
          this.updateLocalStorage();
          this.loadUserRaffles(); // Recarga para sincronizar
          Swal.fire({
            title: '¡Eliminada!',
            text: 'La rifa y datos relacionados han sido eliminados.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar la rifa.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      });
    }
  });
}

deleteRaffle(raffle: Raffle): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la rifa y todos los datos relacionados. Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      // Elimina imágenes en paralelo, pero maneja errores individuales
      const imageDeletions = raffle.producto.imagenes.map(imageUrl => {
        const fileName = imageUrl.split('/').pop()!;
        return this.raffleService.deleteImage(fileName).pipe(
          catchError((error) => {
            console.warn('Imagen no encontrada, ignorando:', fileName, error);
            return of(null); // Continúa
          })
        );
      });

      forkJoin(imageDeletions).pipe(
        switchMap(() => this.raffleService.deleteRaffle(raffle.id!))
      ).subscribe({
        next: () => {
          console.log('✅ Rifa eliminada con éxito');
          this.removeRaffleDataFromLocalStorage(raffle.id!); // Limpia local
          this.activeRaffles = this.activeRaffles.filter(r => r.id !== raffle.id);
          this.completedRaffles = this.completedRaffles.filter(r => r.id !== raffle.id);
          this.updateLocalStorage();

          // 🔥 Recarga usuario para actualizar límites (incrementa si no ejecutada)
          this.raffleService.obtenerUsuarioPorId(this.userId).subscribe({
            next: (usuarioActualizado) => {
              this.actualizarDatosUsuario(usuarioActualizado); // Actualiza cantidadRifas si incrementado
              console.log('Límites actualizados post-eliminación:', usuarioActualizado.cantidadRifas);
            },
            error: (error) => console.error('Error al recargar usuario post-eliminación:', error)
          });

          // Recarga rifas para sincronizar
          this.loadUserRaffles();
          Swal.fire({
            title: '¡Eliminada!',
            text: 'La rifa y datos relacionados han sido eliminados.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        },
        error: (error) => {
          console.error('❌ Error al eliminar rifa:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar la rifa, pero las imágenes sí se eliminaron.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      });
    }
  });
}



private removeRaffleDataFromLocalStorage(raffleId: number): void {
  const storedData = localStorage.getItem('winningData');
  if (storedData) {
    try {
      const winningData = JSON.parse(storedData).filter((entry: any) => entry.raffleId !== raffleId);
      localStorage.setItem('winningData', JSON.stringify(winningData));
      console.log(`Datos de ganadores para la rifa ${raffleId} eliminados.`);
    } catch (error) {
      console.error('Error al parsear winningData:', error);
    }
  }
  localStorage.removeItem(`raffle_${raffleId}`);

  // Eliminar las imágenes en Base64 asociadas al producto de la rifa
  const productId = this.activeRaffles.find(r => r.id === raffleId)?.producto.id ||
                   this.completedRaffles.find(r => r.id === raffleId)?.producto.id;
  if (productId) {
    const productKey = `product_${productId}_images`;
    localStorage.removeItem(productKey);
    console.log(`Imágenes en Base64 para productId ${productId} eliminadas de localStorage.`);
  }
}

private autoDeleteExpiredEmptyRaffles0(): void {
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

  console.log(`🔄 Iniciando revisión automática: ${new Date(now).toLocaleString()}`);

  // 1) Rifas activas sin participantes y vencidas > 1 semana
  this.activeRaffles.forEach(r => {
    const fechaSort = new Date(r.fechaSorteo).getTime();
    const tienePart = this.participantes.some(p => p.raffleId === r.id);
    if (!tienePart && now - fechaSort > oneWeekMs) {
      console.log(`🗑️ Rifas activas SIN participantes vencida >7d: id=${r.id}, nombre="${r.nombre}", fechaSorteo=${r.fechaSorteo}`);
      this.deleteRaffleSilently(r);
    }
  });

  // 2) Rifas ya ejecutadas (inactive) y vencidas > 1 semana
  this.completedRaffles.forEach(r => {
    const fechaSort = new Date(r.fechaSorteo).getTime();
    if (now - fechaSort > oneWeekMs) {
      console.log(`🗑️ Rifa completada vencida >7d: id=${r.id}, nombre="${r.nombre}", fechaSorteo=${r.fechaSorteo}`);
      this.deleteRaffleSilently(r);
    }
  });
}

private autoDeleteExpiredEmptyRaffles(): void {
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  console.log(`🔄 Iniciando revisión automática: ${new Date(now).toLocaleString()}`);

  const allRaffles = [...this.activeRaffles, ...this.completedRaffles];
  const deletions: Raffle[] = [];

  allRaffles.forEach(raffle => {
    const fechaSort = new Date(raffle.fechaSorteo).getTime();
    const isExpired = now - fechaSort > oneWeekMs;

    if (raffle.active && !this.participantes.some(p => p.raffleId === raffle.id) && isExpired) {
      console.log(`🗑️ Rifa activa sin participantes vencida >7d: id=${raffle.id}, nombre="${raffle.nombre}"`);
      deletions.push(raffle);
    } else if (!raffle.active && isExpired) {
      console.log(`🗑️ Rifa completada vencida >7d: id=${raffle.id}, nombre="${raffle.nombre}"`);
      deletions.push(raffle);
    }
  });

  if (deletions.length > 0) {
    deletions.forEach(raffle => this.deleteRaffleSilently(raffle));
  } else {
    console.log('ℹ️ No se encontraron rifas para eliminar automáticamente.');
  }
}


private deleteRaffleSilently0(raffle: Raffle): void {
  console.log(`   ➡️ Eliminando silenciosamente rifa ${raffle.id}`);
  const imageDeletions = raffle.producto.imagenes.map(url => {
    const name = url.split('/').pop()!;
    return this.raffleService.deleteImage(name);
  });

  forkJoin(imageDeletions).pipe(
    switchMap(() => this.raffleService.deleteRaffle(raffle.id!))
  ).subscribe({
    next: () => {
      console.log(`   ✔️ Rifa ${raffle.id} eliminada con éxito`);
      this.userRaffles = this.userRaffles.filter(r => r.id !== raffle.id);
      this.updateRafflesByStatus();
      this.removeRaffleDataFromLocalStorage(raffle.id!);
      Swal.fire({
        title: 'Rifa eliminada',
        text: `La rifa "${raffle.nombre}" ha sido eliminada automáticamente.`,
        icon: 'info',
        timer: 3000
      });
    },
    error: err => console.error(`   ❌ Error borrando rifa ${raffle.id}:`, err)
  });
}

private deleteRaffleSilently(raffle: Raffle): void {
  console.log(`   ➡️ Eliminando silenciosamente rifa ${raffle.id}`);
  const imageDeletions = raffle.producto.imagenes.map(url =>
    this.raffleService.deleteImage(url.split('/').pop()!)
  );

  forkJoin(imageDeletions).pipe(
    switchMap(() => this.raffleService.deleteRaffle(raffle.id!)),
    tap(() => {
      console.log(`   ✔️ Rifa ${raffle.id} eliminada con éxito`);
      this.removeRaffleDataFromLocalStorage(raffle.id!); // Eliminar datos locales, incluyendo imágenes
      this.userRaffles = this.userRaffles.filter(r => r.id !== raffle.id);
      this.activeRaffles = this.activeRaffles.filter(r => r.id !== raffle.id);
      this.completedRaffles = this.completedRaffles.filter(r => r.id !== raffle.id);
      this.updateLocalStorage();
    })
  ).subscribe({
    next: () => {
      Swal.fire({
        title: 'Rifa eliminada',
        text: `La rifa "${raffle.nombre}" ha sido eliminada automáticamente.`,
        icon: 'info',
        timer: 3000,
        showConfirmButton: false
      });
    },
    error: (err) => console.error(`   ❌ Error borrando rifa ${raffle.id}:`, err)
  });
}

private updateLocalStorage(): void {
  const localKey = `raffles_${this.userId}`;
  localStorage.setItem(localKey, JSON.stringify([...this.activeRaffles, ...this.completedRaffles]));
}

/*private updateLocalStorage(): void {
  const localKey = `raffles_${this.userId}`;
  const combinedRaffles = [...this.activeRaffles, ...this.completedRaffles];
  localStorage.setItem(localKey, JSON.stringify(combinedRaffles));
}*/

actualizarEstadoUsuario(): void {
  this.raffleService.getRafflesByUser(this.userId).subscribe({
    next: (rifas: Raffle[]) => {
      console.log('Rifas actuales del usuario después de eliminar:', rifas);

      // 🟢 Si el usuario ya no tiene rifas, actualizamos el estado
      if (rifas.length === 0) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.tieneRifa = false; // 🔄 Actualizar el estado en localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        this.tieneRifa = false; // 🔄 Actualizar variable en el componente
        console.log('Usuario actualizado: ahora puede crear una nueva rifa.');
      }

      // 🔄 Recargar las rifas del usuario sin recargar la página
      //this.loadUserRaffles();
      this.loadUserId()
    },
    error: (error) => {
      console.error('Error al obtener rifas del usuario:', error);
    }
  });
}




copyToClipboard(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    this.messageService.add({
      severity: 'success',
      summary: 'Copiado',
      detail: `Código ${code} copiado al portapapeles`,
      life: 1000
    });
  }).catch(err => {
    console.error('Error al copiar: ', err);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo copiar el código',
      life: 3000
    });
  });
}

copyToClipboard1(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    Swal.fire({
      title: 'Copiado',
      text: 'El enlace ha sido copiado al portapapeles',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  }).catch(err => console.error('Error al copiar:', err));
}


getRaffleUrl(id: number): string {
  return `${window.location.origin}/external-raffle/${id}`;
}


validarCantidadParticipantes() {
  this.cantidadInvalida = this.newRaffle.cantidadParticipantes > 100;
}

validarDescripcion() {
  this.descripcionInvalida = this.productData.descripcion.length > 1500;
}






executeRaffle0(event: Event | null, raffle: Raffle): void {
  if (event) event.stopPropagation();


  this.participanteService.getParticipantesByRaffleId(raffle.id!).subscribe({
    next: participantesRifa => {
      console.log(`Participantes recargados para rifa ${raffle.id}:`, participantesRifa);

      if (participantesRifa.length === 0) {
        Swal.fire({
          title: 'No hay participantes',
          text: 'No se puede ejecutar la rifa sin participantes registrados.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        return;
      }


      Swal.fire({
        title: '¿Ejecutar rifa?',
        text: 'Esta acción ejecutará el sorteo y desactivará la rifa. ¿Desea continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, ejecutar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          // 3) Guarda la selección y arranca la cuenta
          this.selectedRaffle = raffle;
          this.showCountdown = true;
          this.raffleExecutionService.startCountdown(5);
        }
      });
    },
    error: err => {
      console.error(`Error recargando participantes para rifa ${raffle.id}:`, err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo verificar los participantes. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  });
}


executeRaffle(event: Event | null, raffle: Raffle): void {
  if (event) event.stopPropagation();

  this.participanteService.getParticipantesByRaffleId(raffle.id!).subscribe({
    next: participantesRifa => {
      if (participantesRifa.length === 0) {
        Swal.fire({
          title: 'No hay participantes',
          text: 'No se puede ejecutar la rifa sin participantes registrados.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      Swal.fire({
        title: '¿Ejecutar rifa?',
        text: 'Esta acción ejecutará el sorteo y desactivará la rifa. ¿Desea continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, ejecutar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          this.selectedRaffle = raffle;
          this.showCountdown = true;

          // 🔥 Iniciar la ejecución del sorteo en el backend
          this.raffleService.executeRaffle(raffle.id!).subscribe({
            next: ganadorData => {
              console.log("🏆 Resultado del sorteo desde el backend:", ganadorData);
              //this.processWinner(ganadorData);
              this.processWinner(ganadorData, raffle.id!);
            },
            error: err => {
              console.error("❌ Error al ejecutar el sorteo:", err);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo ejecutar el sorteo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
          });
        }
      });
    },
    error: err => {
      console.error(`❌ Error recargando participantes para rifa ${raffle.id}:`, err);
    }
  });
}


private processWinner0(ganadorData: any): void {
  this.showCountdown = false;

  const winningNumber = ganadorData.rifa.winningNumber; // 🔥 Extraer el número ganador del objeto `rifa`

  if (!ganadorData.ganador) {
    Swal.fire({
      title: 'Sorteo sin ganador',
      text: `El número ganador es ${winningNumber}, pero no ha sido reservado.`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  Swal.fire({
    title: '¡Sorteo Ejecutado!',
    html: `
      <p>Número: <b>${winningNumber}</b></p>
      <p>Ganador: <b>${ganadorData.ganador.name} ${ganadorData.ganador.lastName}</b></p>
      <p>Teléfono: <b>${ganadorData.ganador.phone}</b></p>
    `,
    icon: 'success',
    confirmButtonText: 'Aceptar'

  });
this.updateRafflesByStatus();
this.loadWinningInfo();


}

private processWinner(ganadorData: any, raffleId: number): void { // Agregar raffleId como parámetro
  this.showCountdown = false;

  const winningNumber = ganadorData.rifa.winningNumber; // 🔥 Extraer el número ganador del objeto `rifa`

  if (!ganadorData.ganador) {
    Swal.fire({
      title: 'Sorteo sin ganador',
      text: `El número ganador es ${winningNumber}, pero no ha sido reservado.`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  Swal.fire({
    title: '¡Sorteo Ejecutado!',
    html: `
      <p>Número: <b>${winningNumber}</b></p>
      <p>Ganador: <b>${ganadorData.ganador.name} ${ganadorData.ganador.lastName}</b></p>
      <p>Teléfono: <b>${ganadorData.ganador.phone}</b></p>
    `,
    icon: 'success',
    confirmButtonText: 'Aceptar'
  }).then(result => {
    if (result.isConfirmed) {
      // 🔥 Automatizar el envío: Llamar a shareWinnerOnWhatsApp después de confirmar el Swal
      this.shareWinnerOnWhatsApp(raffleId);
    }
  });

  this.updateRafflesByStatus();
  this.loadWinningInfo();
}

checkRifasParaAutoEjecutar0(): void {
  const now = Date.now(); // 🔥 Obtener la fecha actual en milisegundos

  this.activeRaffles.forEach(raffle => {
    this.participanteService.getParticipantesByRaffleId(raffle.id!).subscribe({
      next: participantesRifa => {
        console.log(`✅ Participantes recargados para rifa ${raffle.id}:`, participantesRifa);

        const raffleTime = new Date(raffle.fechaSorteo).getTime();
        const overdue = now > raffleTime; // 🔥 Verificar que la fecha de ejecución haya pasado
        const hasParticipants = participantesRifa.length > 0; // 🔥 Verificar que haya al menos un participante

        // 🔥 Ejecutar la rifa automáticamente si la fecha ha pasado y hay al menos un participante
        if (raffle.active && hasParticipants && overdue) {
          console.log(`🚀 Rifa lista para ejecución automática: ${raffle.id}`);
          this.showCountdown = true;
          this.executeAutoRaffle(raffle);
          this.updateRafflesByStatus();
          this.loadWinningInfo();
        } else if (raffle.active && !hasParticipants && overdue) {
          console.log(`⚠️ Rifa ${raffle.id} vencida sin participantes.`);
        }
      },
      error: err => {
        console.error(`❌ Error recargando participantes para rifa ${raffle.id}:`, err);
      }
    });
  });
}

checkRifasParaAutoEjecutar(): void {
  const now = Date.now(); // Obtener la fecha actual en milisegundos

  this.activeRaffles.forEach(raffle => {
    // Recargar participantes desde el backend para cada rifa
    this.participanteService.getParticipantesByRaffleId(raffle.id!).subscribe({
      next: participantesRifa => {
        console.log(`✅ Participantes recargados para rifa ${raffle.id}:`, participantesRifa);

        // Convertir la fecha de ejecución a milisegundos y determinar si ya ha vencido
        const raffleTime = new Date(raffle.fechaSorteo).getTime();
        const overdue = now >= raffleTime;
        const hasParticipants = participantesRifa.length > 0;
        // Comprobar si todos los números han sido reservados:
        const allReserved = participantesRifa.length === Number(raffle.cantidadParticipantes);

        console.log(`📌 Rifa ${raffle.id}: overdue: ${overdue}, participantes: ${participantesRifa.length}, cantidad permitida: ${raffle.cantidadParticipantes}, allReserved: ${allReserved}`);

        // Si la rifa está activa y tiene participantes, y se cumple la condición de fecha vencida o que se hayan reservado todos los números,
        // se procede a su ejecución automática.
        if (raffle.active && hasParticipants && (overdue || allReserved)) {
          console.log(`🚀 Auto–ejecutando rifa ${raffle.id}: vencida? ${overdue}, completa? ${allReserved}`);
          this.selectedRaffle = raffle;
          this.showCountdown = true;
          // Inicia el conteo regresivo para ejecutar la rifa automáticamente (por ejemplo, 5 segundos)
          this.raffleExecutionService.startCountdown(5);
          // Actualiza el estado de las rifas y carga la información del ganador (si aplica)
          this.updateRafflesByStatus();
          this.loadWinningInfo();
        } else if (raffle.active && !hasParticipants && overdue) {
          console.log(`⚠️ Rifa ${raffle.id} vencida sin participantes.`);
        }
      },
      error: err => {
        console.error(`❌ No se pudo recargar participantes para rifa ${raffle.id}:`, err);
      }
    });
  });
}



private executeAutoRaffle(raffle: Raffle): void {
  this.raffleService.executeRaffle(raffle.id!).subscribe({
    next: ganadorData => {
      console.log("🏆 Resultado del sorteo automático:", ganadorData);
      //this.processWinner(ganadorData);
      this.processWinner(ganadorData, raffle.id!);
    },
    error: err => {
      console.error("❌ Error al ejecutar el sorteo automático:", err);
    }
  });
}





onCountdownFinished(): void {
  this.showCountdown = false;

  if (!this.selectedRaffle) {
    console.error("❌ No hay rifa seleccionada.");
    return;
  }

  console.log("📡 Ejecutando rifa en el backend...");

  this.raffleService.executeRaffle(this.selectedRaffle.id!).subscribe({
    next: ganadorData => {
      //this.processWinner(ganadorData);
       this.processWinner(ganadorData, this.selectedRaffle.id!);
    },
    error: err => {
      console.error("❌ Error obteniendo ganador desde el backend:", err);
    }
  });
}



updateRafflesByStatus0(): void {
  console.log('🔄 Actualizando rifas desde el backend...');

  this.raffleService.obtenerRifasPorUsuarioId(this.currentUser.id).subscribe({  // 🔥 Obtener rifas solo del usuario
    next: (updatedRaffles) => {
      this.userRaffles = updatedRaffles;
      this.activeRaffles = this.userRaffles.filter(raffle => raffle.active);
      this.completedRaffles = this.userRaffles.filter(raffle => !raffle.active);

      console.log('✅ Rifas activas:', this.activeRaffles);
      console.log('✅ Rifas terminadas:', this.completedRaffles);
    },
    error: (err) => {
      console.error('❌ Error al obtener rifas actualizadas:', err);
    }
  });
}

updateRafflesByStatus(): void {
  console.log('🔄 Actualizando rifas desde el backend...');
  this.raffleService.obtenerRifasPorUsuarioId(this.currentUser.id).subscribe({
    next: (updatedRaffles) => {
      this.userRaffles = updatedRaffles;
      this.activeRaffles = updatedRaffles.filter(raffle => raffle.active);
      this.completedRaffles = updatedRaffles.filter(raffle => !raffle.active);

      // Actualizar localStorage con las rifas combinadas
      const localKey = `raffles_${this.currentUser.id}`;
      localStorage.setItem(localKey, JSON.stringify([...this.activeRaffles, ...this.completedRaffles]));

      console.log('✅ Rifas activas:', this.activeRaffles);
      console.log('✅ Rifas terminadas:', this.completedRaffles);
    },
    error: (err) => {
      console.error('❌ Error al obtener rifas actualizadas:', err);
      // Opcional: Usar datos de localStorage como fallback si falla el backend
      const localKey = `raffles_${this.currentUser.id}`;
      const localRaffles = localStorage.getItem(localKey);
      if (localRaffles) {
        this.userRaffles = JSON.parse(localRaffles);
        this.updateRaffleLists();
        console.warn('⚠️ Usando datos de localStorage como fallback.');
      }
    }
  });
}

private updateRaffleLists(): void {
  this.activeRaffles = this.userRaffles.filter(raffle => raffle.active);
  this.completedRaffles = this.userRaffles.filter(raffle => !raffle.active);
}


private applyDefaultImages(): void {
  this.userRaffles.forEach(raffle => {
    if (!raffle.producto.imagenes || raffle.producto.imagenes.length === 0) {
      raffle.producto.imagenes = ['assets/images/default.jpg'];
    }
  });
}

private setNewlyCreatedRaffle(): void {
  if (this.userRaffles.length > 0) {
    this.newlyCreatedRaffle = this.userRaffles[0];
  }
}

listenForRaffleExecution(): void {
  this.webSocketService.listen(`/topic/raffle-executed`).subscribe((data: any) => {
    console.log(`✅ Rifa ejecutada en otro lugar. ID: ${data.rifaId}`);
    this.updateRafflesByStatus(); // 🔄 Actualiza las rifas activas/inactivas
  });
}






compartirRifa(raffle: any) {
  this.router.navigate(['/external-raffle', raffle.id], { state: { raffle } });
}






showDialog0(): void {
  console.log('🔍 Verificando límite para crear rifa...');

  // 1. Usa propiedad de componente como principal (fija)
  let initialCantidadRifas = this.initialCantidadRifas; // Fijo 10

  // 2. Fallback a localStorage si propiedad no set (ej. recarga)
  if (initialCantidadRifas === 1 || !this.initialCantidadRifas) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const vipInitialKey = `vipInitialLimit_${this.userId}`;
    initialCantidadRifas = parseInt(localStorage.getItem(vipInitialKey) || '1', 10);
    this.initialCantidadRifas = initialCantidadRifas; // Set propiedad para futuras llamadas
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const cantidadRifasPermitidas = currentUser.cantidadRifas || 1; // Restantes (decrementa)
  const currentCodigoVip = currentUser.codigoVip || ''; // Código actual para filtro
  console.log('Límite inicial fijo:', initialCantidadRifas, 'Restantes:', cantidadRifasPermitidas, 'Código actual:', currentCodigoVip, 'VIP:', this.isVip);

  // 🔥 Conteo filtrado solo del código actual (para límites, no display)
  const totalRifasFiltradas = this.userRaffles ? this.userRaffles.filter(r => r.codigoVipUsado === currentCodigoVip).length : 0;
  console.log('Rifas creadas (filtradas por código):', totalRifasFiltradas);

  // Para display, usa todas (userRaffles completo)
  const totalRifasDisplay = this.userRaffles ? this.userRaffles.length : 0;
  console.log('Rifas totales para display:', totalRifasDisplay);

  if (!this.isVip && totalRifasDisplay >= 1) {
    console.log('Bloqueo no VIP: totalRifasDisplay >= 1');
    Swal.fire({
      title: 'Límite alcanzado',
      text: 'Los usuarios que no son VIP solo pueden tener una rifa.',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
    return;
  }

  if (this.isVip && totalRifasFiltradas >= initialCantidadRifas) { // 🔥 Compara filtradas con fijo (10)
    console.log('Bloqueo VIP: totalRifasFiltradas >= initialLimit');
    Swal.fire({
      title: 'Límite alcanzado',
      //text: `Ya has creado ${totalRifasFiltradas} rifas con este código VIP (límite inicial: ${initialCantidadRifas}). Restantes: ${cantidadRifasPermitidas}.`,
      text: `Ya has creado ${totalRifasFiltradas} rifas con este código VIP si desea crear más rifas obtenga un nuevo codigo VIP`,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
    return;
  }

  console.log('✅ Límite OK, abriendo modal...');
  this.displayDialog = true;
}

showDialog(): void {
  console.log('🔍 Verificando límite para crear rifa...');

  // 🔥 Fetch initialCantidadRifas del backend (límite fijo del código VIP actual)
  this.authService.getVipInitialLimit(this.userId).subscribe({
    next: (initialCantidadRifas) => {
      console.log('🔥 Backend initialCantidadRifas (límite fijo código VIP):', initialCantidadRifas);
      this.initialCantidadRifas = initialCantidadRifas;

      // Continúa validación
      this.performVipValidation(initialCantidadRifas);
    },
    error: (error) => {
      console.error('❌ Error backend initial limit:', error);
      // Fallback localStorage
      const fallback = this.getLocalInitialLimit();
      console.log('🔥 Fallback localStorage initialCantidadRifas:', fallback);
      this.initialCantidadRifas = fallback;
      this.performVipValidation(fallback);
    }
  });
}

// 🔥 Helper privado: Fallback local
private getLocalInitialLimit(): number {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const vipInitialKey = `vipInitialLimit_${this.userId}`;
  const stored = localStorage.getItem(vipInitialKey);
  const parsed = stored ? parseInt(stored, 10) : NaN;
  return isNaN(parsed) ? 1 : parsed;
}

// 🔥 Helper privado: Validación VIP (evita duplicar)
private performVipValidation(initialCantidadRifas: number): void {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const cantidadRifasPermitidas = currentUser.cantidadRifas || 1; // Restantes
  const currentCodigoVip = currentUser.codigoVip || '';
  console.log('Límite inicial fijo (backend/local):', initialCantidadRifas, 'Restantes:', cantidadRifasPermitidas, 'Código actual:', currentCodigoVip, 'VIP:', this.isVip);

  const totalRifasFiltradas = this.userRaffles ? this.userRaffles.filter(r => r.codigoVipUsado === currentCodigoVip).length : 0;
  console.log('Rifas creadas (filtradas por código):', totalRifasFiltradas);

  const totalRifasDisplay = this.userRaffles ? this.userRaffles.length : 0;
  console.log('Rifas totales para display:', totalRifasDisplay);

  if (!this.isVip && totalRifasDisplay >= 1) {
    console.log('Bloqueo no VIP: totalRifasDisplay >= 1');
    Swal.fire({
      title: 'Límite alcanzado',
      text: 'Los usuarios que no son VIP solo pueden tener una rifa.',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
    return;
  }

  if (this.isVip && totalRifasFiltradas >= initialCantidadRifas) {
    console.log('Bloqueo VIP: totalRifasFiltradas >= initialLimit');
    Swal.fire({
      title: 'Límite alcanzado',
      text: `Ya has creado ${totalRifasFiltradas} rifas con este código VIP si desea crear más rifas obtenga un nuevo codigo VIP`,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
    return;
  }

  console.log('✅ Límite OK, abriendo modal...');
  this.displayDialog = true;
}



  showProductDialog() {
    this.displayProductDialog = true;
  }

  // Ocultar modal de producto
  hideProductDialog() {
    this.displayProductDialog = false;
    this.displayDialog1 = false;
  }

  hideProductDialog1(): void {

    this.subida = false
    // Reinicia los arrays para que al volver a abrir se muestren inputs vacíos
    this.selectedFiles = [];
    this.previews = [];

    if (this.fileInputs) {
      this.fileInputs.forEach(input => input.nativeElement.value = '');
    }
  }

   // Abrir el modal
   abrirModal(): void {
    this.displayDialog1 = true;
    this.codigoVip= ''
  }

  openSubir() {
   this.subida = true
    }




  onFileChange(event: Event, index: number) {
    // Restricción: solo se permiten 4 imágenes en total.
    // Si el índice es mayor o igual a 4, muestra un error y no procesa el archivo.
    if (index >= 3) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo puedes subir 4 imágenes para el producto',
        life: 3000
      });
      return;
    }

    // Adicionalmente, si el array de imágenes del producto ya tiene 4 elementos, muestra error.
    if (this.productData.imagenes && this.productData.imagenes.length >= 4) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo puedes subir 4 imágenes para el producto',
        life: 3000
      });
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const maxWidth = 6000;  // Resolución máxima permitida
        const maxHeight = 6000; // Resolución máxima permitida

        if (img.width > maxWidth || img.height > maxHeight) {
          this.messageService.add({
            severity: 'error',
            summary: 'Advertencia',
            detail: `La imagen supera la resolución permitida de ${maxWidth}x${maxHeight}px`,
            life: 3000
          });
          input.value = ""; // Resetea el input
        } else {
          // Asigna el archivo al slot indicado
          this.selectedFiles[index] = file;

          // Lee la imagen para mostrar vista previa
          const reader = new FileReader();
          reader.onload = (e) => {
            this.previews[index] = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }

        URL.revokeObjectURL(img.src); // Libera memoria
      };
    }
  }



  removeSelectedImage(index: number): void {
    this.selectedFiles[index] = null;
    this.previews[index] = null;
    if (this.fileInputs) {
      this.fileInputs.forEach(input => input.nativeElement.value = '');
    }
  }

  clearFile(index: number): void {
    this.previews[index] = null;
    this.selectedFiles[index] = null;
  }

  shareOnWhatsApp1(): void {
    const url = 'https://sweet-laughter-production.up.railway.app/';
    const text = `Necesito un codigo VIP. ${url}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`; window.location.href = whatsappUrl;
  }



  shareOnWhatsApp(): void {
  const message = encodeURIComponent('Hola! 🎉 Estoy usando Súper Sorteo 📈, una app que te permite crear rifas 🎁 y venderlas rápidamente ⏱. Si necesitas ingresos extra 💸, te invito a visitarla 🌐 https://supersorteo.fun/ 😊 ¡Espero que te sea útil!');
  const whatsappUrl = `whatsapp://send?text=${message}`;
  window.location.href = whatsappUrl;
  setTimeout(() => {
    if (document.hidden) {
      alert('Asegúrate de tener WhatsApp instalado.');
    }
  }, 1000); // Verifica después de 1 segundo si no se abrió
}






shareRaffleOnWhatsApp(raffle: any): void {
  const message = encodeURIComponent(
    `¡Hola! 🎉 Mira esta rifa en Súper Sorteo: "${raffle.nombre}" 📈\n` +
    `con ${raffle.cantidadParticipantes} participantes y premios por $${raffle.precio} 💰.\n` +
    `¡Participa ahora y gana! 😊\n\n` +
    `${this.getRaffleUrl(raffle.id)}` // URL separada para visualización clara
  );
  const whatsappUrl = `whatsapp://send?text=${message}`;
  //window.open(whatsappUrl, '_blank'); // Abre WhatsApp web/app en nueva pestaña (mejor fallback)
   window.location.href = whatsappUrl;
  setTimeout(() => {
    if (document.hidden) {
      Swal.fire({
        title: '¡Enviado!',
        text: 'El mensaje con el enlace de la rifa ha sido enviado a WhatsApp.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }, 1000);
}





shareWinnerOnWhatsApp0(raffleId: number): void {
  console.log("📡 Buscando ganador para la rifa ID:", raffleId);

  const entry = this.getWinningEntry(raffleId);

  console.log("📊 Datos obtenidos de getWinningEntry:", entry);

  if (!entry || !entry.ganador?.phone) {
    Swal.fire({
      title: 'Sin ganador',
      text: 'Aún no hay ganador con teléfono disponible.',
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
    console.log("❌ No se encontró un ganador válido con teléfono.");
    return;
  }

  const phone = entry.ganador.phone.replace(/\D+/g, '');

  if (!phone || phone.length < 10) {
    Swal.fire({
      title: 'Número no válido',
      text: 'El número de teléfono del ganador es incorrecto.',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
    console.log("❌ Número de teléfono inválido:", phone);
    return;
  }

  const raffleName = entry.rifa.nombre;
  const productName = entry.rifa.winningNumber ? `Premio ${entry.rifa.winningNumber}` : 'este sorteo';

  const message =
    `🎉 ¡Felicidades ${entry.ganador.name} ${entry.ganador.lastName}! 🎉\n\n` +
    `Has ganado la rifa *"${raffleName}"* 🎁\n` +
    `Premio: *${productName}*\n` +
    `Número ganador: *${entry.rifa.winningNumber}*\n\n` +
    `📲 Para más detalles, comunícate con el organizador.`;

  console.log("🏆 Datos del ganador:");
  console.log("Nombre:", entry.ganador.name, entry.ganador.lastName);
  console.log("Teléfono:", phone);
  console.log("Mensaje a enviar:", message);

  // 🔥 Abrir directamente WhatsApp en el móvil
  const whatsappUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
  window.location.href = whatsappUrl;
}

shareWinnerOnWhatsApp(raffleId: number): void {
  console.log("📡 Buscando ganador para la rifa ID:", raffleId);

  const entry = this.getWinningEntry(raffleId);

  console.log("📊 Datos obtenidos de getWinningEntry:", entry);

  if (!entry || !entry.ganador?.phone) {
    Swal.fire({
      title: 'Sin ganador',
      text: 'Aún no hay ganador con teléfono disponible.',
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
    console.log("❌ No se encontró un ganador válido con teléfono.");
    return;
  }

  const phone = entry.ganador.phone.replace(/\D+/g, '');

  if (!phone || phone.length < 10) {
    Swal.fire({
      title: 'Número no válido',
      text: 'El número de teléfono del ganador es incorrecto.',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
    console.log("❌ Número de teléfono inválido:", phone);
    return;
  }

  const raffleName = entry.rifa.nombre;
  //const productName = entry.rifa.winningNumber ? `Premio ${entry.rifa.winningNumber}` : 'este sorteo';
  const productName = entry.rifa.producto?.nombre ?? 'este sorteo';
  const message =
    `🎉 ¡Felicidades ${entry.ganador.name} ${entry.ganador.lastName}! 🎉\n\n` +
    `Has ganado la rifa *"${raffleName}"* 🎁\n` +
    `Premio: *${productName}*\n` +
    `Número ganador: *${entry.rifa.winningNumber}*\n\n` +
    `📲 Para más detalles, comunícate con el organizador.`;

  console.log("🏆 Datos del ganador:");
  console.log("Nombre:", entry.ganador.name, entry.ganador.lastName);
  console.log("Teléfono:", phone);
  console.log("Mensaje a enviar:", message);

  // 🔥 Abrir directamente WhatsApp en el móvil
  const whatsappUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
  window.location.href = whatsappUrl;
}




onSubmit0(): void {
  if (!this.validarFormularioRifa()) {
    console.error('El formulario no es válido.');
    return;
  }
  if (!this.productData || !this.productData.nombre) {
    this.messageService.add({ severity: 'error', summary: 'Error en el producto', detail: 'Debe agregar un producto correctamente antes de guardar la rifa.', life: 2000 });
    return;
  }
  if (this.isVip && !this.codigoVip) {
    console.error('Código VIP no válido');
    return;
  }

  // 🔥 Validación para evitar que usuarios sin código VIP creen más de una rifa
  if (!this.isVip && this.activeRaffles.length >= 1) {
    Swal.fire({
      title: 'Lo sentimos',
      text: 'Solo usuarios con código VIP pueden crear más de una rifa. Podrás crear otra el siguiente mes.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const fechaSorteoFormatted = typeof this.newRaffle.fechaSorteo === 'string'
    ? this.newRaffle.fechaSorteo
    : this.newRaffle.fechaSorteo.toISOString().split('T')[0];

  const requestBody: Raffle = {
    nombre: this.newRaffle.nombre,
    cantidadParticipantes: Number(this.newRaffle.cantidadParticipantes),
    fechaSorteo: fechaSorteoFormatted,
    usuario: {
      id: this.userId,
      esVip: Boolean(this.isVip),
      codigoVip: this.codigoVip || undefined
    },
    producto: {
      nombre: this.productData.nombre,
      descripcion: this.productData.descripcion,
      imagenes: this.productData.imagenes
    },
    active: true,
    executed: false,
    code: this.newRaffle.code,
    precio: Number(this.newRaffle.precio)
  };

  console.log('Cuerpo de la solicitud:', requestBody);

  const createRaffle$ = this.isVip && this.codigoVip
    ? this.raffleService.crearRifaConCodigoVip(requestBody, this.codigoVip)
    : this.raffleService.crearRifa(requestBody);

  createRaffle$
    .pipe(
      tap((response) => {
        console.log('✅ Rifa creada con éxito:', response);

        // 🔥 Agregar la nueva rifa directamente en la lista activa
        this.activeRaffles.unshift(response);
        this.newlyCreatedRaffle = response;

        // 🔥 Volver a cargar todas las rifas en caso de cambios en el backend
        this.loadUserId();
      })
    )
    .subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rifa creada y añadida a las rifas activas.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          customClass: { popup: 'my-swal-popup' }
        });
        this.hideDialog();
        this.resetFormulario();
        this.productData = { nombre: '', descripcion: '', imagenes: [] };
        if (this.mainEditor) {
          this.mainEditor.nativeElement.innerHTML = '';
        }
      },
      error: (error) => {
        console.error('❌ Error al crear la rifa:', error);
        this.mostrarErrorCreacion(error);
      },
    });
}

onSubmit1(): void {
  if (!this.validarFormularioRifa()) {
    console.error('El formulario no es válido.');
    return;
  }
  if (!this.productData || !this.productData.nombre) {
    this.messageService.add({ severity: 'error', summary: 'Error en el producto', detail: 'Debe agregar un producto correctamente antes de guardar la rifa.', life: 2000 });
    return;
  }
  if (this.isVip && !this.codigoVip) {
    console.error('Código VIP no válido');
    return;
  }

  // 🔥 Validación para evitar que usuarios sin código VIP creen más de una rifa
  if (!this.isVip && this.activeRaffles.length >= 1) {
    Swal.fire({
      title: 'Límite alcanzado',
      text: 'Solo usuarios con código VIP pueden crear más de una rifa.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const fechaSorteoFormatted = typeof this.newRaffle.fechaSorteo === 'string'
    ? this.newRaffle.fechaSorteo
    : this.newRaffle.fechaSorteo.toISOString().split('T')[0];

  const requestBody: Raffle = {
    nombre: this.newRaffle.nombre,
    cantidadParticipantes: Number(this.newRaffle.cantidadParticipantes),
    fechaSorteo: fechaSorteoFormatted,
    usuario: {
      id: this.userId,
      esVip: Boolean(this.isVip),
      codigoVip: this.codigoVip || undefined
    },
    producto: {
      nombre: this.productData.nombre,
      descripcion: this.productData.descripcion,
      imagenes: this.productData.imagenes

    },
    active: true,
    executed: false,
    code: this.newRaffle.code,
    precio: Number(this.newRaffle.precio)
  };

  console.log('Cuerpo de la solicitud:', requestBody);

  const createRaffle$ = this.isVip && this.codigoVip
    ? this.raffleService.crearRifaConCodigoVip(requestBody, this.codigoVip)
    : this.raffleService.crearRifa(requestBody);

  createRaffle$
    .pipe(
      tap((response) => {
        console.log('✅ Rifa creada con éxito:', response);

        // 🔥 Agregar la nueva rifa directamente en la lista activa
        this.activeRaffles.unshift(response);
        this.newlyCreatedRaffle = response;

        // 🔥 Guardar en localStorage
        localStorage.setItem(`raffles_${this.userId}`, JSON.stringify(this.activeRaffles));
        this.productData.id = response.producto.id;
        // 🔥 Volver a cargar todas las rifas en caso de cambios en el backend (solo si es necesario)
        this.loadUserId();
      })
    )
    .subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rifa creada y añadida a las rifas activas.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          customClass: { popup: 'my-swal-popup' }
        });
        this.hideDialog();
        this.resetFormulario();
        this.productData = { nombre: '', descripcion: '', imagenes: [] };
        if (this.mainEditor) {
          this.mainEditor.nativeElement.innerHTML = '';
        }
      },
      error: (error) => {
        console.error('❌ Error al crear la rifa:', error);
        this.mostrarErrorCreacion(error);
      },
    });
}

/*
onSubmit(): void {
  if (!this.validarFormularioRifa()) {
    console.error('El formulario no es válido.');
    return;
  }
  if (!this.productData || !this.productData.nombre) {
    this.messageService.add({ severity: 'error', summary: 'Error en el producto', detail: 'Debe agregar un producto correctamente antes de guardar la rifa.', life: 2000 });
    return;
  }
  if (this.isVip && !this.codigoVip) {
    console.error('Código VIP no válido');
    return;
  }

  if (!this.isVip && this.activeRaffles.length >= 1) {
    Swal.fire({
      title: 'Límite alcanzado',
      text: 'Solo usuarios con código VIP pueden crear más de una rifa.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const fechaSorteoFormatted = typeof this.newRaffle.fechaSorteo === 'string'
    ? this.newRaffle.fechaSorteo
    : this.newRaffle.fechaSorteo.toISOString().split('T')[0];

  const requestBody: Raffle = {
    nombre: this.newRaffle.nombre,
    cantidadParticipantes: Number(this.newRaffle.cantidadParticipantes),
    fechaSorteo: fechaSorteoFormatted,
    usuario: { id: this.userId, esVip: Boolean(this.isVip), codigoVip: this.codigoVip || undefined },
    producto: { nombre: this.productData.nombre, descripcion: this.productData.descripcion, imagenes: this.productData.imagenes },
    active: true,
    executed: false,
    code: this.newRaffle.code,
    precio: Number(this.newRaffle.precio)
  };

  console.log('Cuerpo de la solicitud:', requestBody);

  const createRaffle$ = this.isVip && this.codigoVip
    ? this.raffleService.crearRifaConCodigoVip(requestBody, this.codigoVip)
    : this.raffleService.crearRifa(requestBody);

  createRaffle$
    .pipe(
      tap((response) => {
        console.log('✅ Rifa creada con éxito:', response);

        this.activeRaffles.unshift(response);
        this.newlyCreatedRaffle = response;

        // Asignar el id del producto antes de procesar las imágenes
        this.productData.id = response.producto.id;

        // Guardar imágenes pendientes en IndexedDB con el id real
        if (this.db && this.pendingImages) {
          Object.entries(this.pendingImages).forEach(([slot, { blob, url }]) => {
            if (this.productData.id !== undefined) { // Verificación explícita
              this.saveImageToIndexedDB(this.productData.id, blob, Number(slot));
              console.log(`🖼️ Imagen guardada en IndexedDB para productId ${this.productData.id}, slot ${slot}: ${url}`);
            } else {
              console.error('❌ productData.id es undefined, no se puede guardar la imagen');
            }
          });
          this.pendingImages = {}; // Limpiar después de guardar
        }

        localStorage.setItem(`raffles_${this.userId}`, JSON.stringify(this.activeRaffles));
        this.loadUserId();
        this.loadUserRaffles(); // Actualizar vista
      })
    )
    .subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rifa creada y añadida a las rifas activas.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          customClass: { popup: 'my-swal-popup' }
        });
        this.hideDialog();
        this.resetFormulario();
        this.productData = { nombre: '', descripcion: '', imagenes: [] };
        if (this.mainEditor) {
          this.mainEditor.nativeElement.innerHTML = '';
        }
      },
      error: (error) => {
        console.error('❌ Error al crear la rifa:', error);
        this.mostrarErrorCreacion(error);
      },
    });
}*/

onSubmit2(): void {
  if (!this.validarFormularioRifa()) {
    console.error('El formulario no es válido.');
    return;
  }
  if (!this.productData || !this.productData.nombre) {
    this.messageService.add({ severity: 'error', summary: 'Error en el producto', detail: 'Debe agregar un producto correctamente antes de guardar la rifa.', life: 2000 });
    return;
  }
  if (this.isVip && !this.codigoVip) {
    console.error('Código VIP no válido');
    return;
  }

  if (!this.isVip && this.activeRaffles.length >= 1) {
    Swal.fire({
      title: 'Lo sentimos',
      text: 'Solo usuarios con código VIP pueden crear más de una rifa. Podrás crear otra el siguiente mes.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const fechaSorteoFormatted = typeof this.newRaffle.fechaSorteo === 'string'
    ? this.newRaffle.fechaSorteo
    : this.newRaffle.fechaSorteo.toISOString().split('T')[0];

  const requestBody: Raffle = {
    nombre: this.newRaffle.nombre,
    cantidadParticipantes: Number(this.newRaffle.cantidadParticipantes),
    fechaSorteo: fechaSorteoFormatted,
    usuario: { id: this.userId, esVip: Boolean(this.isVip), codigoVip: this.codigoVip || undefined },
    producto: { nombre: this.productData.nombre, descripcion: this.productData.descripcion, imagenes: this.productData.imagenes },
    active: true,
    executed: false,
    code: this.newRaffle.code,
    precio: Number(this.newRaffle.precio)
  };

  console.log('Cuerpo de la solicitud:', requestBody);

  const createRaffle$ = this.isVip && this.codigoVip
    ? this.raffleService.crearRifaConCodigoVip(requestBody, this.codigoVip)
    : this.raffleService.crearRifa(requestBody);

  createRaffle$
    .pipe(
      tap((response) => {
        console.log('✅ Rifa creada con éxito:', response);

        this.activeRaffles.unshift(response);
        this.newlyCreatedRaffle = response;
        this.productData.id = response.producto.id;

        // Migrar imágenes temporales a la clave definitiva
        if (this.pendingImages) {
          const tempKey = `product_temp_images`;
          const tempImages = JSON.parse(localStorage.getItem(tempKey) || '{}');
          if (tempImages && Object.keys(tempImages).length > 0) {
            const productKey = `product_${this.productData.id}_images`;
            localStorage.setItem(productKey, JSON.stringify(tempImages));
            localStorage.removeItem(tempKey); // Limpiar temporal
            console.log(`🖼️ Imágenes migradas a localStorage para productId ${this.productData.id}:`, tempImages);
          }
          this.pendingImages = {}; // Limpiar pendientes
        }

        localStorage.setItem(`raffles_${this.userId}`, JSON.stringify(this.activeRaffles));
        this.loadUserId();
        this.loadUserRaffles(); // Actualizar vista
      })
    )
    .subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rifa creada y añadida a las rifas activas.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          customClass: { popup: 'my-swal-popup' }
        });
        this.hideDialog();
        this.resetFormulario();
        this.productData = { nombre: '', descripcion: '', imagenes: [] };
        if (this.mainEditor) {
          this.mainEditor.nativeElement.innerHTML = '';
        }
      },
      error: (error) => {
        console.error('❌ Error al crear la rifa:', error);
        this.mostrarErrorCreacion(error);
      },
    });
}

onSubmit(): void {
  if (!this.validarFormularioRifa()) {
    console.error('El formulario no es válido.');
    return;
  }
  if (!this.productData || !this.productData.nombre) {
    this.messageService.add({ severity: 'error', summary: 'Error en el producto', detail: 'Debe agregar un producto correctamente antes de guardar la rifa.', life: 2000 });
    return;
  }
  if (this.isVip && !this.codigoVip) {
    console.error('Código VIP no válido');
    return;
  }

  if (!this.isVip && this.activeRaffles.length >= 1) {
    Swal.fire({
      title: 'Lo sentimos',
      text: 'Solo usuarios con código VIP pueden crear más de una rifa. Podrás crear otra el siguiente mes.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const fechaSorteoFormatted = typeof this.newRaffle.fechaSorteo === 'string'
    ? this.newRaffle.fechaSorteo
    : this.newRaffle.fechaSorteo.toISOString().split('T')[0];

  const requestBody: Raffle = {
    nombre: this.newRaffle.nombre,
    cantidadParticipantes: Number(this.newRaffle.cantidadParticipantes),
    fechaSorteo: fechaSorteoFormatted,
    usuario: { id: this.userId, esVip: Boolean(this.isVip), codigoVip: this.codigoVip || undefined },
    producto: { nombre: this.productData.nombre, descripcion: this.productData.descripcion, imagenes: this.productData.imagenes },
    active: true,
    executed: false,
    code: this.newRaffle.code,
    precio: Number(this.newRaffle.precio)
  };

  console.log('Cuerpo de la solicitud:', requestBody);

  const createRaffle$ = this.isVip && this.codigoVip
    ? this.raffleService.crearRifaConCodigoVip(requestBody, this.codigoVip)
    : this.raffleService.crearRifa(requestBody);

  createRaffle$
    .pipe(
      tap((response) => {
        console.log('✅ Rifa creada con éxito:', response);

        this.activeRaffles.unshift(response);
        this.newlyCreatedRaffle = response;
        this.productData.id = response.producto.id;

        // Migrar imágenes temporales a la clave definitiva
        if (this.pendingImages) {
          const tempKey = `product_temp_images`;
          const tempImages = JSON.parse(localStorage.getItem(tempKey) || '{}');
          if (tempImages && Object.keys(tempImages).length > 0) {
            const productKey = `product_${this.productData.id}_images`;
            localStorage.setItem(productKey, JSON.stringify(tempImages));
            localStorage.removeItem(tempKey); // Limpiar temporal
            console.log(`🖼️ Imágenes migradas a localStorage para productId ${this.productData.id}:`, tempImages);
          }
          this.pendingImages = {}; // Limpiar pendientes
        }

        localStorage.setItem(`raffles_${this.userId}`, JSON.stringify(this.activeRaffles));
        this.loadUserId();
        this.loadUserRaffles(); // Actualizar vista
      })
    )
    .subscribe({
      next: () => {
        // 🔥 Recarga usuario del backend (con cantidadRifas decremented)
        this.raffleService.obtenerUsuarioPorId(this.userId).subscribe({
          next: (usuarioActualizado) => {
            console.log('Usuario después de crear rifa:', usuarioActualizado);
            console.log('Cantidad rifas decremented:', usuarioActualizado.cantidadRifas); // 9

            // Actualiza solo restantes, preserva inicial separado
            const vipInitialKey = `vipInitialLimit_${this.userId}`;
            const initialLimit = parseInt(localStorage.getItem(vipInitialKey) || '1', 10); // Lee fijo 10
            console.log('Límite inicial fijo desde localStorage:', initialLimit); // 10

            const currentUserRaw = localStorage.getItem('currentUser');
            if (currentUserRaw) {
              const currentUser = JSON.parse(currentUserRaw);
              currentUser.cantidadRifas = usuarioActualizado.cantidadRifas; // Decrementa a 9
              // NO toca vipInitialLimit (fijo en clave separada)
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
              console.log('localStorage después de crear: restantes=9 (initial fijo en vipInitialLimit)');
            }

            // Recarga rifas para totalRifas fresco
            this.loadUserRaffles();

            Swal.fire({
              title: '¡Éxito!',
              text: 'Rifa creada y añadida a las rifas activas.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              customClass: { popup: 'my-swal-popup' }
            });
            this.hideDialog();
            this.resetFormulario();
            this.productData = { nombre: '', descripcion: '', imagenes: [] };
            if (this.mainEditor) {
              this.mainEditor.nativeElement.innerHTML = '';
            }
          },
          error: (error) => {
            console.error('Error al recargar usuario después de crear rifa:', error);
            // Fallback: Usa valor anterior
            Swal.fire('Éxito', 'Rifa creada, pero error al actualizar datos del usuario.', 'warning');
            this.hideDialog();
            this.resetFormulario();
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al crear la rifa:', error);
        this.mostrarErrorCreacion(error);
      },
    });
}


// Método reutilizable para mostrar mensajes
private mostrarMensaje(icono: 'success' | 'error' | 'warning', titulo: string, mensaje: string): void {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: icono,
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'my-swal-popup'
    }
  });
}


private mostrarErrorCreacion(error: any): void {
  let errorMessage = 'No se pudo crear la rifa. Por favor, inténtelo nuevamente.';

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  }

  // 🔥 Validación especial para el límite de rifas
  if (errorMessage.includes('Has alcanzado el límite de rifas permitidas.')) {
    Swal.fire({
      title: 'Lo sentimos',
      text: 'Ya has alcanzado el número máximo de rifas permitidas según tu código VIP.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
  } else {
    Swal.fire({
      title: 'Error',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
}



  isValid1(): boolean {
    return (
      this.newRaffle.nombre.trim() !== '' &&
      this.newRaffle.cantidadParticipantes > 0 &&
      this.productData.nombre.trim() !== '' &&
      this.productData.descripcion.trim() !== '' &&
      this.productData.imagenes.length > 0
    );
  }

  isValid(): boolean {
    if (
      !this.newRaffle.nombre || this.newRaffle.nombre.trim() === '' ||
      !this.newRaffle.cantidadParticipantes || this.newRaffle.cantidadParticipantes <= 0 ||
      !this.newRaffle.fechaSorteo ||
      !this.productData.nombre || this.productData.nombre.trim() === '' ||
      !this.productData.descripcion || this.productData.descripcion.trim() === '' ||
      !this.productData.imagenes || this.productData.imagenes.length === 0
    ) {
      return false;
    }
    return true;
  }


  hideDialog(): void {
    this.displayDialog = false;

      }


    resetFormulario() {
  this.newRaffle = {
    nombre: '',
    cantidadParticipantes: 0,
    fechaSorteo: new Date(),
    usuario: { id: this.userId, esVip: false }, // 🔥 Corregimos `usuario`
    producto: {} as Producto,
    active: true,
    executed: false, // 🔥 Agregar propiedad faltante
    precio: 0,
    code: '' // 🔥 Agregar código por defecto
  };

  // Solo borrar el código VIP si el usuario NO es VIP
  if (!this.isVip) {
    this.codigoVip = '';
  }
}


      validarFormularioProducto(): boolean {
        let mensajeError = '';

        if (!this.productData.nombre || this.productData.nombre.trim().length === 0) {
          mensajeError += '⚠️ El nombre del producto es obligatorio.\n';
        }

        if (!this.productData.descripcion || this.productData.descripcion.trim().length === 0) {
          mensajeError += '⚠️ La descripción del producto es obligatoria.\n';
        } else if (this.productData.descripcion.length > 1500) {
          mensajeError += '⚠️ La descripción no puede superar los 1500 caracteres.\n';
        }

        if (!this.productData.imagenes || this.productData.imagenes.length === 0) {
          mensajeError += '⚠️ Debes agregar al menos una imagen del producto.\n';
        }

        if (mensajeError) {
          this.messageService.add({
            severity: 'error',
            summary: 'Errores en el producto',
            detail: mensajeError,
            life: 5000
          });
          return false;
        }

        return true;
      }

      validarFormularioRifa(): boolean {
        let mensajeError = '';

        if (!this.newRaffle.nombre || this.newRaffle.nombre.trim().length === 0) {
          mensajeError += '⚠️ El nombre del sorteo es obligatorio.\n';
        }

        if (!this.newRaffle.cantidadParticipantes || this.newRaffle.cantidadParticipantes <= 0) {
          mensajeError += '⚠️ La cantidad de participantes debe ser mayor a 0.\n';
        } else if (this.newRaffle.cantidadParticipantes > 100) {
          mensajeError += '⚠️ No pueden haber más de 100 participantes.\n';
        }

        if (!this.newRaffle.fechaSorteo) {
          mensajeError += '⚠️ La fecha del sorteo es obligatoria.\n';
        } else {
          const fechaIngresada = new Date(this.newRaffle.fechaSorteo);
          const fechaActual = new Date();
          if (fechaIngresada < fechaActual) {
            mensajeError += '⚠️ La fecha del sorteo debe ser futura.\n';
          }
        }

        if (!this.newRaffle.producto) {
          mensajeError += '⚠️ Debes agregar un producto antes de guardar la rifa.\n';
        }

        if (mensajeError) {
          this.messageService.add({
            severity: 'error',
            summary: 'Errores en la rifa',
            detail: mensajeError,
            life: 5000
          });
          return false;
        }

        return true;
      }




      saveProductData(): void {
        if (!this.validarFormularioProducto()) {
          return;
        }

        this.newRaffle.producto = this.productData;
        console.log('Datos del producto guardados:', this.productData);
        this.hideProductDialog();
      }

      saveProductData1(): void {
        this.newRaffle.producto = this.productData;
        console.log('Datos del producto guardados:', this.productData);
        this.hideProductDialog();

      }




/*
      uploadProductImage0(index: number): void {
        const file = this.selectedFiles[index];

        if (!file) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: `No hay imagen para subir en el slot ${index}.`,
            life: 1000
          });
          return;
        }

        this.uploading = true;

        this.raffleService.uploadImages([file]).subscribe({
          next: (uploadedUrls: string[]) => {
            this.productData.imagenes.push(...uploadedUrls);

            // Limpia el slot una vez subida la imagen
            this.selectedFiles[index] = null;
            this.previews[index] = null;
            this.uploading = false;

            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Imagen subida correctamente en el slot ${index}.`,
              life: 1000
            });
          },
          error: (error) => {
            this.uploading = false;

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al subir la imagen en el slot ${index}.`,
              life: 1000
            });
          }
        });
      }

uploadProductImage1(index: number): void {
  const file = this.selectedFiles[index];

  if (!file) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: `No hay imagen para subir en el slot ${index}.`,
      life: 1000
    });
    return;
  }

  this.uploading = true;
  console.log(`📤 Subiendo imagen desde slot ${index}:`, file.name);

  this.raffleService.uploadImages([file]).subscribe({
    next: (uploadedUrls: string[]) => {
      const imageUrl = uploadedUrls[0];
      this.productData.imagenes.push(imageUrl);

      // Convertir archivo a Blob y guardar en IndexedDB
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const blob = new Blob([e.target.result], { type: file.type });
        if (this.db && this.productData.id) { // Asegúrate de que db e id estén disponibles
          this.saveImageToIndexedDB(this.productData.id, blob, index);
        } else {
          console.warn('⚠️ IndexedDB o productId no inicializado, imagen solo guardada en backend');
        }
      };
      reader.readAsArrayBuffer(file);

      this.selectedFiles[index] = null;
      this.previews[index] = null;
      this.uploading = false;

      console.log(`✅ Imagen subida y guardada en IndexedDB: ${imageUrl}`);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Imagen subida correctamente en el slot ${index}.`,
        life: 1000
      });
    },
    error: (error) => {
      this.uploading = false;
      console.error(`❌ Error al subir imagen en slot ${index}:`, error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Error al subir la imagen en el slot ${index}.`,
        life: 1000
      });
    }
  });
}

uploadProductImage2(index: number): void {
  const file = this.selectedFiles[index];

  if (!file) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: `No hay imagen para subir en el slot ${index}.`,
      life: 1000
    });
    return;
  }

  this.uploading = true;
  console.log(`📤 Subiendo imagen desde slot ${index}:`, file.name);

  this.raffleService.uploadImages([file]).subscribe({
    next: (uploadedUrls: string[]) => {
      const imageUrl = uploadedUrls[0];
      this.productData.imagenes.push(imageUrl);

      // Almacenar temporalmente el blob para guardarlo después con el id real
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const blob = new Blob([e.target.result], { type: file.type });
        this.pendingImages = this.pendingImages || {};
        this.pendingImages[index] = { blob, url: imageUrl };
        console.log(`✅ Imagen subida al backend y almacenada temporalmente para slot ${index}: ${imageUrl}`);
      };
      reader.readAsArrayBuffer(file);

      this.selectedFiles[index] = null;
      this.previews[index] = null;
      this.uploading = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Imagen subida correctamente en el slot ${index}.`,
        life: 1000
      });
    },
    error: (error) => {
      this.uploading = false;
      console.error(`❌ Error al subir imagen en slot ${index}:`, error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Error al subir la imagen en el slot ${index}.`,
        life: 1000
      });
    }
  });
}
*/

uploadProductImage(index: number): void {
  const file = this.selectedFiles[index];

  if (!file) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: `No hay imagen para subir en el slot ${index}.`,
      life: 1000
    });
    return;
  }

  this.uploading = true;
  console.log(`📤 Subiendo imagen desde slot ${index}:`, file.name);

  this.raffleService.uploadImages([file]).subscribe({
    next: (uploadedUrls: string[]) => {
      const imageUrl = uploadedUrls[0];
      this.productData.imagenes.push(imageUrl);

      // Convertir archivo a Base64 y guardar en localStorage temporalmente
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result as string; // data:image/png;base64,...
        const tempKey = `product_temp_images`;
        const tempImages = JSON.parse(localStorage.getItem(tempKey) || '{}');
        tempImages[index] = base64;
        localStorage.setItem(tempKey, JSON.stringify(tempImages));
        console.log(`🖼️ Imagen guardada en localStorage como base64 para slot ${index}:`, base64.substring(0, 50) + '...');
      };
      reader.readAsDataURL(file); // Genera base64

      this.selectedFiles[index] = null;
      this.previews[index] = null;
      this.uploading = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Imagen subida correctamente en el slot ${index}.`,
        life: 1000
      });
    },
    error: (error) => {
      this.uploading = false;
      console.error(`❌ Error al subir imagen en slot ${index}:`, error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Error al subir la imagen en el slot ${index}.`,
        life: 1000
      });
    }
  });
}
// Nueva propiedad para imágenes pendientes
//pendingImages: { [key: number]: { blob: Blob; url: string } } = {};
pendingImages: { [key: number]: string } = {};

private saveImageToIndexedDB0(productId: number | string, blob: Blob, index: number): void {
  if (!this.db) {
    console.error('❌ IndexedDB no disponible');
    return;
  }

  const transaction = this.db.transaction(['images'], 'readwrite');
  const store = transaction.objectStore('images');
  const request = store.put({ productId, blob, slot: index });

  request.onsuccess = () => {
    console.log(`🖼️ Imagen guardada exitosamente en IndexedDB para productId ${productId}, slot ${index}`);
    console.log(`📏 Tamaño del blob: ${blob.size} bytes`); // Añade el tamaño para confirmar
  };
  request.onerror = () => console.error(`❌ Error al guardar imagen en IndexedDB para productId ${productId}`);
}

/*
private saveImageToIndexedDB(productId: number | string, blob: Blob, index: number): void {
  if (!this.db) {
    console.error('❌ IndexedDB no disponible');
    return;
  }

  const transaction = this.db.transaction(['images'], 'readwrite');
  const store = transaction.objectStore('images');
  const request = store.put({ productId, blob, slot: index });

  request.onsuccess = () => console.log(`🖼️ Imagen guardada en IndexedDB para productId ${productId}, slot ${index}`);
  request.onerror = () => console.error(`❌ Error al guardar imagen en IndexedDB para productId ${productId}`);
}*/

private saveImageToIndexedDB(productId: number | string, blob: Blob, index: number): void {
  if (!this.db) {
    console.error('❌ IndexedDB no disponible');
    return;
  }

  const transaction = this.db.transaction(['images'], 'readwrite');
  const store = transaction.objectStore('images');
  const getRequest = store.get(productId);

  getRequest.onsuccess = (event: any) => {
    const existingData = event.target.result || { productId, images: [] };
    existingData.images[index] = { blob, slot: index };
    const putRequest = store.put(existingData);

    putRequest.onsuccess = () => console.log(`🖼️ Imagen guardada/actualizada en IndexedDB para productId ${productId}, slot ${index}`);
    putRequest.onerror = () => console.error(`❌ Error al guardar imagen en IndexedDB para productId ${productId}`);
  };

  getRequest.onerror = () => console.error(`❌ Error al recuperar imagen en IndexedDB para productId ${productId}`);
}


loadAllParticipantsForMyRaffles(): void {
  if (!this.userRaffles || this.userRaffles.length === 0) {
    console.warn('No hay rifas del usuario para cargar participantes.');
    return;
  }

  this.userRaffles.forEach((raffle) => {
    this.participanteService.getParticipantesByRaffleId(raffle.id).subscribe({
      next: (participantes) => {
        // Puedes agregar los participantes directamente a la rifa
        (raffle as any).participantes = participantes;
        console.log(`✅ Participantes cargados para la rifa ${raffle.id}:`, participantes);
      },
      error: (error) => {
        console.error(`❌ Error al cargar participantes para la rifa ${raffle.id}:`, error);
      }
    });
  });
}



      cerrarModalParticipantes(){
        this.datosParticipantes = false
      }

      mostrarParticipantes(raffleId: number): void {
        this.participanteService.getParticipantesByRaffleId(raffleId).subscribe({
          next: (data) => {
            this.participantes = data;
            console.log(`Participantes para la rifa ${raffleId}:`, this.participantes);

            // Cargar la rifa para obtener la cantidad de participantes
            this.raffleService.obtenerRifaPorId(raffleId).subscribe({
              next: (raffle) => {
                const totalParticipantes = parseInt(raffle.cantidadParticipantes, 10) || 10;
                this.availableNumbers = Array.from({ length: totalParticipantes }, (_, i) => i + 1);
                console.log(`Números disponibles para la rifa ${raffleId}:`, this.availableNumbers);
              },
              error: (err) => console.error(`Error al cargar la rifa ${raffleId}:`, err)
            });

            this.datosParticipantes = true; // Abre el modal
          },
          error: (err) => console.error(`Error al cargar participantes para la rifa ${raffleId}:`, err)
        });
      }







mostrarParticipantesTerminados(raffleId: number): void {
  this.raffleService.getWinnerByRaffleId(raffleId).subscribe({
    next: (winnerData) => {
      this.winningNumber = winnerData?.ganador?.reservedNumber ?? null;
      this.participantes = winnerData.participantes;
      this.selectedRaffleId = raffleId;
      this.datosParticipantesFinalizados = true;

      console.log('Ganador:', this.winningNumber ?? "Sin ganador", 'en rifa', this.selectedRaffleId);
    },
    error: (error) => {
      console.error('❌ Error al obtener ganador de la rifa:', error);
    }
  });
}










      eliminarParticipante(id: number): void {
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta seguro que desea eliminar este participante',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.participanteService.deleteParticipante(id).subscribe({
              next: () => {
                this.participantes = this.participantes.filter(p => p.id !== id);
                this.numerosReservados = this.participantes
                  .filter(p => p.reservedNumber !== null)
                  .map(p => p.reservedNumber);

                Swal.fire({
                  title: 'Eliminado',
                  text: 'El participante ha sido eliminado correctamente',
                  icon: 'success',
                  timer: 1500,
                  confirmButtonText: 'Aceptar',
                });
              },
              error: (err) => {
                console.error('Error al eliminar el participante:', err);
                Swal.fire({
                  title: 'Error',
                  text: 'No se pudo eliminar el participante',
                  icon: 'error',
                  timer: 3000,
                  confirmButtonText: 'Aceptar',
                });
              }
            });
          }
        });
        this.cerrarModalParticipantes()

      }

      eliminarParticipante1(id: number): void {
        this.participanteService.deleteParticipante(id).subscribe({
          next: () => {
            console.log('Participante eliminado:', id);
            // No es necesario llamar a refresh aquí, ya que el BehaviorSubject actualizará automáticamente
          },
          error: (err) => console.error('Error al eliminar participante:', err)
        });
      }





getCategoria(id: string): string {
  const categorias: { [key: string]: string } = {
    '5': 'Mini',
    '10': 'Medium',
    '15': 'Large'
  };
  return categorias[id] || 'Desconocido'; // Ahora compara con ID directo
}



getDescripcion(id: string): string {
  const descripciones: { [key: string]: string } = {
    '5': 'Explora las posibilidades de SuperSorteo con este plan inicial.',
    '10': 'Para los entusiastas que buscan alcanzar el exito ;)',
    '15': 'Esto es cosa de grandes..para corazones ambiciosos. ¡Vamos por todo!'
  };
  return descripciones[id] || 'Sin descripción'; // Usa ID directo
}


onPageChange(event: any): void {
  const index = event.page; // Obtiene el índice de la imagen activa
  console.log('Índice activo:', index);

  if (index >= 0 && index < this.imagenes.length) {
    this.imagenSeleccionada = this.imagenes[index];
    console.log('Imagen seleccionada:', this.imagenSeleccionada.id);
    console.log('Cantidad de rifas:', this.imagenSeleccionada.rifas);
  } else {
    console.error('Error: Índice fuera de rango.');
  }
}


comprarRifas0(): void {
  if (!this.imagenSeleccionada) {
    console.log('No hay imagen seleccionada');
    return;
  }

  console.log(`Comprando ${this.imagenSeleccionada.rifas} rifas para el paquete ${this.imagenSeleccionada.id}`);

  const numeroWhatsApp = '+54 9 11 3339-2207';
  const mensaje = `Quiero comprar ${this.imagenSeleccionada.rifas} rifas del paquete ${this.imagenSeleccionada.id}.`;

  const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;

  window.open(enlaceWhatsApp, '_blank');
}


comprarRifas1(img: any): void {
  if (!img) {
    console.log('No hay imagen seleccionada.');
    return;
  }

  console.log(`Comprando ${img.rifas} rifas para el paquete ${img.id}`);

  const numeroWhatsApp = '+54 9 11 3339-2207';
  const mensaje = `Hola! me interesa comprar un código VIP para el plan de ${img.rifas} rifas.`;

  const enlaceWhatsApp = `whatsapp://send?phone=${numeroWhatsApp.replace(/\D/g, '')}&text=${encodeURIComponent(mensaje)}`;

  window.location.href = enlaceWhatsApp; // Esto intentará abrir directamente la app de WhatsApp
}



comprarRifas00(img: any): void {
  if (!img) {
    console.log('No hay imagen seleccionada.');
    return;
  }

  console.log('Click Comprar - ID:', img.id);
  const cantidadRifas = img.rifas;
  const usuarioId = this.userId; // Asegúrate de tener el ID del usuario actual

  console.log(`🛒 Iniciando compra de ${cantidadRifas} rifas para el usuario ${usuarioId}`);

  this.codigoVipService.generarPreferenciaPago(cantidadRifas, usuarioId).subscribe({
    next: (response) => {
      const preferenceId = response.id;
      const precio = response.precio;

      console.log('✅ Preferencia MP creada - ID:', preferenceId);
      console.log(`💰 Precio del código VIP: $${precio}`);

      const containerId = 'wallet_container_' + img.id;

      setTimeout(() => {
        const container = document.getElementById(containerId);
        if (!container) {
          console.error(`❌ Contenedor ${containerId} no encontrado`);
          return;
        }

        /*const mp = new MercadoPago('APP_USR-e00bfa8c-9642-4459-a1c0-c3d78ac5e8b1', {
          locale: 'es-AR'
        });*/

        //produccion
         const mp = new MercadoPago('APP_USR-a0ecd62d-ddc6-4b42-ad56-de1384731571', {
          locale: 'es-AR'
        });


        const bricksBuilder = mp.bricks();
        bricksBuilder.create('wallet', containerId, {
          initialization: {
            preferenceId: preferenceId
          },
          customization: {
            visual: {
              style: {
                theme: 'default'
              }
            }
          }
        });
      }, 100);
    },
    error: (error) => {
      console.error('❌ Error al generar preferencia:', error);
      Swal.fire('Error', 'No se pudo iniciar el pago con Mercado Pago.', 'error');
    }
  });
}

comprarRifas(img: any): void {
  if (!img) {
    console.log('No hay imagen seleccionada.');
    return;
  }

  console.log('Click Comprar - ID:', img.id);
  const cantidadRifas = img.rifas;
  const usuarioId = this.userId;

  console.log(`🛒 Iniciando compra de ${cantidadRifas} rifas para el usuario ${usuarioId}`);

  this.codigoVipService.generarPreferenciaPago(cantidadRifas, usuarioId).subscribe({
    next: (response) => {
      const preferenceId = response.id;
      const precio = response.precio;

      console.log('✅ Preferencia MP creada - ID:', preferenceId);
      console.log(`💰 Precio del código VIP: $${precio}`);

      const containerId = 'wallet_container_' + img.id;

      setTimeout(() => {
        const container = document.getElementById(containerId);
        if (!container) {
          console.error(`❌ Contenedor ${containerId} no encontrado`);
          return;
        }

        const mp = new MercadoPago('APP_USR-a0ecd62d-ddc6-4b42-ad56-de1384731571', {
          locale: 'es-AR'
        });

        const bricksBuilder = mp.bricks();
        bricksBuilder.create('wallet', containerId, {
          initialization: { preferenceId: preferenceId },
          customization: { visual: { style: { theme: 'default' } } }
        });
      }, 100);
    },
    error: (httpError) => {
      this.displayDialog1 = false
      console.error('❌ Error al generar preferencia:', httpError);

      // 🔥 Aquí capturamos el mensaje exacto que viene del backend
      let mensajeError = 'No se pudo iniciar el pago con Mercado Pago.';

      if (httpError.error && httpError.error.error) {
        mensajeError = httpError.error.error; // ← Este es el mensaje del backend
      } else if (typeof httpError.error === 'string') {
        mensajeError = httpError.error;
      }

   Swal.fire({
  icon: 'info',
  title: 'Aún tienes rifas disponibles 🎉',
  text: mensajeError,
  confirmButtonText: 'OK'
});
    }
  });
}


seleccionarImagen(img: string): void {
  this.imagenSeleccionada = img;
  console.log('Imagen seleccionada:', this.imagenSeleccionada); // Para depuración
}

showJuegoResponsableModal(): void {
  this.juegoResponsableVisible = true;
}

redirectToJuegoResponsable(): void {
    window.open('https://www.saberjugar.gob.ar/', '_blank');
  }


      ngOnDestroy(): void {
        window.removeEventListener('storage', this.onStorageEvent.bind(this));
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
      }

}
