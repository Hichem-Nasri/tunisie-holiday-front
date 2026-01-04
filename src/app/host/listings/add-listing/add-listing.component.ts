import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';

@Component({
  selector: 'app-add-listing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-listing.component.html',
  styleUrls: ['./add-listing.component.scss'],
})
export class AddListingComponent {
  isSubmitting = false;

  // files selected
  selectedFiles: File[] = [];

  // for preview
  previews: string[] = [];

  amenitiesList: string[] = [
    'WiFi',
    'Climatisation',
    'Chauffage',
    'Cuisine',
    'TV',
    'Machine à laver',
    'Parking',
  ];

  listingForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    pricePerNight: [0, [Validators.required, Validators.min(1)]],
    city: ['', Validators.required],
    address: ['', Validators.required],
    maxGuests: [1, [Validators.required, Validators.min(1)]],
    type: ['APARTMENT', Validators.required],
    // ✅ NOUVEAUX CHAMPS
    bedrooms: [1, [Validators.min(0)]],
    beds: [1, [Validators.min(0)]],
    bathrooms: [1, [Validators.min(0)]],
    amenities: this.fb.control<string[]>([]),
    houseRules: [''],
    checkInTime: ['14:00'],
    checkOutTime: ['11:00'],
  });

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService,
    private router: Router
  ) {}

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // reset then fill
    this.selectedFiles = Array.from(input.files);

    // generate previews
    this.previews = [];
    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => this.previews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }

  onAmenityChange(event: any) {
    const value = event.target.value;
    const amenities = this.listingForm.value.amenities || [];

    if (event.target.checked) {
      amenities.push(value);
    } else {
      const index = amenities.indexOf(value);
      if (index >= 0) amenities.splice(index, 1);
    }

    this.listingForm.patchValue({ amenities });
  }

  onSubmit(): void {
    if (this.listingForm.invalid) {
      this.listingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // 1️⃣ Create listing (JSON)
    this.listingService.createListing(this.listingForm.value as any).subscribe({
      next: (created) => {
        const listingId = created?.id;

        // 2️⃣ Upload images if any
        if (listingId && this.selectedFiles.length > 0) {
          this.listingService
            .uploadImages(listingId, this.selectedFiles)
            .subscribe({
              next: () => {
                this.isSubmitting = false;
                this.router.navigate(['/host/listings']);
              },
              error: (err) => {
                console.error('Upload images error', err);
                this.isSubmitting = false;
                alert('Listing created, but image upload failed.');
                this.router.navigate(['/host/listings']);
              },
            });
        } else {
          this.isSubmitting = false;
          this.router.navigate(['/host/listings']);
        }
      },
      error: (err) => {
        console.error('Create listing error', err);
        this.isSubmitting = false;
        alert('Failed to create listing');
      },
    });
  }
}
