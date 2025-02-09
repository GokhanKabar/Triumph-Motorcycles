import { TestRideStatus, RiderExperience, LicenseType } from '../../../domain/testRide/entities/TestRide';

export interface TestRideDto {
  id: string;
  concessionId: string;
  concessionName?: string;
  motorcycleId: string;
  motorcycleName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  desiredDate: Date;
  status: TestRideStatus;
  riderExperience: RiderExperience;
  licenseType: LicenseType;
  licenseNumber: string;
  hasTrainingCertificate: boolean;
  preferredRideTime?: string;
  additionalRequirements?: string;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTestRideDto {
  concessionId: string;
  concessionName?: string;
  motorcycleId: string;
  motorcycleName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  desiredDate: Date;
  riderExperience?: RiderExperience;
  licenseType?: LicenseType;
  licenseNumber?: string;
  hasTrainingCertificate?: boolean;
  preferredRideTime?: string;
  additionalRequirements?: string;
  message?: string;
}

export interface UpdateTestRideStatusDto {
  id: string;
  status: TestRideStatus;
}
