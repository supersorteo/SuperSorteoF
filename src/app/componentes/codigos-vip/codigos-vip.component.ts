import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CodigoVip } from '../../interfaces/codigo-vip';
import { CodigoVipServiceService } from '../../services/codigo-vip-service.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-codigos-vip',
  standalone: true,
  imports: [CommonModule,  FormsModule, TableModule, ButtonModule, DropdownModule],
  templateUrl: './codigos-vip.component.html',
  styleUrl: './codigos-vip.component.scss'
})
export class CodigosVipComponent implements OnInit{
  codigosVip: CodigoVip[] = [];
  cantidadRifasOptions = [
    { label: '10 Rifas', value: 10 },
    { label: '15 Rifas', value: 15 },
    { label: '30 Rifas', value: 30 }
  ];
  cantidadRifas: number = 10;
  selectedCodigo!: CodigoVip;
  constructor(private codigoVipService: CodigoVipServiceService) {}

  ngOnInit(): void {
  this.obtenerCodigosVip()
  }

  obtenerCodigosVip0() {
    this.codigoVipService.obtenerCodigosVip().subscribe({
      next: (data) => {
        this.codigosVip = data;
        console.log('📋 Lista de Códigos VIP obtenidos:', this.codigosVip);
        Swal.fire({
          title: 'Códigos cargados',
          text: `Se han cargado ${this.codigosVip.length} códigos VIP correctamente.`,
          icon: 'success'
        });
      },
      error: (err) => {
        console.error('❌ Error al obtener los códigos VIP:', err);
        Swal.fire({
          title: 'Error al cargar',
          text: 'No se pudieron cargar los códigos VIP. Inténtalo de nuevo.',
          icon: 'error'
        });
      }
    });
  }


obtenerCodigosVip() {
  this.codigoVipService.obtenerCodigosVip().subscribe({
    next: (data) => {
      this.codigosVip = data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); // Ordenar por ID descendente
      console.log('📋 Lista de Códigos VIP obtenidos:', this.codigosVip);
      Swal.fire({
        title: 'Códigos cargados',
        text: `Se han cargado ${this.codigosVip.length} códigos VIP correctamente.`,
        icon: 'success'
      });
    },
    error: (err) => {
      console.error('❌ Error al obtener los códigos VIP:', err);
      Swal.fire({
        title: 'Error al cargar',
        text: 'No se pudieron cargar los códigos VIP. Inténtalo de nuevo.',
        icon: 'error'
      });
    }
  });
}







  generarCodigoVip0() {
    this.codigoVipService.generarCodigoVip(this.cantidadRifas).subscribe({
      next: (res) => {
        const nuevoCodigo: any = { codigo: res.codigo, cantidadRifas: this.cantidadRifas, utilizado: false };
        this.codigosVip.push(nuevoCodigo);
        console.log('✅ Código VIP generado:', nuevoCodigo);
        Swal.fire({
          title: '¡Código generado!',
          text: `Se ha generado el código VIP: ${res.codigo} con ${this.cantidadRifas} rifas.`,
          icon: 'success'
        });
      },
      error: (err) => {
        console.error('❌ Error al generar el código VIP:', err);
        Swal.fire({
          title: 'Error al generar código',
          text: 'Hubo un problema al generar el código VIP. Inténtalo más tarde.',
          icon: 'error'
        });
      }
    });
  }



generarCodigoVip() {
  this.codigoVipService.generarCodigoVip(this.cantidadRifas).subscribe({
    next: (res) => {
      console.log('🔍 Respuesta del backend:', res); // Verifica lo que devuelve el servidor
      if (!res || !res.codigo || !res.id) {
        console.error('❌ La respuesta del backend es inválida:', res);
        Swal.fire({
          title: 'Error',
          text: 'La respuesta del servidor no contiene un código válido.',
          icon: 'error'
        });
        return;
      }

      const nuevoCodigo: CodigoVip = {
        id: res.id,
        codigo: res.codigo,
        cantidadRifas: this.cantidadRifas,
        utilizado: false
      };
      this.codigosVip.unshift(nuevoCodigo); // Agregar al inicio
      console.log('✅ Código VIP generado:', nuevoCodigo);
      Swal.fire({
        title: '¡Código generado!',
        text: `Se ha generado el código VIP: ${res.codigo} con ${this.cantidadRifas} rifas.`,
        icon: 'success'
      });
    },
    error: (err) => {
      console.error('❌ Error al generar el código VIP:', err);
      Swal.fire({
        title: 'Error al generar código',
        text: 'Hubo un problema al generar el código VIP. Inténtalo más tarde.',
        icon: 'error'
      });
    }
  });
}





  copiarCodigo(codigo: string) {
  navigator.clipboard.writeText(codigo).then(() => {
    Swal.fire({
      title: 'Código copiado',
      text: `El código ${codigo} ha sido copiado al portapapeles.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }).catch(err => {
    console.error('❌ Error al copiar el código:', err);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo copiar el código al portapapeles.',
      icon: 'error'
    });
  });
}


}
