import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-listing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-listing.component.html',
})
export class EditListingComponent implements OnInit {
  listingId!: number;
  isSubmitting = false;

  amenitiesList = [
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

    // 🔥 nouveaux champs
    bedrooms: [0],
    beds: [0],
    bathrooms: [0],
    amenities: this.fb.control<string[]>([]),
    houseRules: [''],
    checkInTime: [''],
    checkOutTime: [''],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingService
  ) {}

  ngOnInit(): void {
    this.listingId = Number(this.route.snapshot.paramMap.get('id'));

    this.listingService.getListingById(this.listingId).subscribe((listing) => {
      this.listingForm.patchValue({
        title: listing.title,
        description: listing.description,
        pricePerNight: listing.pricePerNight,
        city: listing.city,
        address: listing.address,
        maxGuests: listing.maxGuests,
        type: listing.type,

        bedrooms: listing.bedrooms,
        beds: listing.beds,
        bathrooms: listing.bathrooms,
        amenities: listing.amenities || [],
        houseRules: listing.houseRules,
        checkInTime: listing.checkInTime,
        checkOutTime: listing.checkOutTime,
      });
    });
  }

  onSubmit(): void {
    if (this.listingForm.invalid) return;

    this.isSubmitting = true;

    this.listingService
      .updateListing(this.listingId, this.listingForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/host/listings']);
        },
        error: () => {
          this.isSubmitting = false;
          alert('Failed to update listing');
        },
      });
  }

  onAmenityChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const control = this.listingForm.get('amenities');
    if (!control) return;

    const values = [...(control.value || [])] as string[];

    if (checkbox.checked) {
      values.push(checkbox.value);
    } else {
      const index = values.indexOf(checkbox.value);
      if (index >= 0) values.splice(index, 1);
    }

    control.setValue(values);
  }
}
