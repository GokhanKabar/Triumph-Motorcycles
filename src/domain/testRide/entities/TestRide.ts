import { v4 as uuidv4 } from 'uuid';
import { TestRideValidationError } from '../errors/TestRideValidationError';
import { MissingRequiredFieldError } from '../../errors/MissingRequiredFieldError';
import { IMotorcycleRepository } from '../../motorcycle/repositories/IMotorcycleRepository';

export enum TestRideStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum RiderExperience {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum LicenseType {
  A1 = 'A1',
  A2 = 'A2',
  A = 'A',
  AM = 'AM'
}

export default class TestRide {
  constructor(
    public readonly id: string,
    public readonly concessionId: string,
    public readonly motorcycleId: string,
    public readonly motorcycleName: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phoneNumber: string,
    public readonly desiredDate: Date,
    public readonly status: TestRideStatus,
    public readonly riderExperience: RiderExperience,
    public readonly licenseType: LicenseType,
    public readonly licenseNumber: string,
    public readonly hasTrainingCertificate: boolean,
    public readonly preferredRideTime?: string,
    public readonly additionalRequirements?: string,
    public readonly message?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly concessionName?: string
  ) {}

  public static async from(
    id: string | undefined,
    concessionId: string,
    motorcycleId: string,
    motorcycleName: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    desiredDate: Date,
    riderExperience: RiderExperience,
    licenseType: LicenseType,
    licenseNumber: string,
    hasTrainingCertificate: boolean,
    preferredRideTime?: string,
    additionalRequirements?: string,
    message?: string,
    status?: TestRideStatus,
    createdAt?: Date,
    updatedAt?: Date,
    concessionName?: string,
    motorcycleRepository?: IMotorcycleRepository
  ): Promise<TestRide | TestRideValidationError> {
    const validationErrors: Record<string, string> = {};

    // Générer un ID s'il n'est pas fourni
    const testRideId = id || uuidv4();

    if (!concessionId) {
      validationErrors['concessionId'] = 'Un identifiant de concession est requis';
    }

    if (!motorcycleId) {
      validationErrors['motorcycleId'] = 'Un identifiant de moto est requis';
    }

    if (!motorcycleName) {
      validationErrors['motorcycleName'] = 'Le nom de la moto est requis';
    }

    if (!firstName) {
      validationErrors['firstName'] = 'Le prénom est requis';
    }

    if (!lastName) {
      validationErrors['lastName'] = 'Le nom est requis';
    }

    if (!email) {
      validationErrors['email'] = 'L\'email est requis';
    }

    if (!phoneNumber) {
      validationErrors['phoneNumber'] = 'Le numéro de téléphone est requis';
    }

    if (!desiredDate) {
      validationErrors['desiredDate'] = 'La date souhaitée est requise';
    }

    if (!riderExperience) {
      validationErrors['riderExperience'] = 'L\'expérience du pilote est requise';
    }

    if (!licenseType) {
      validationErrors['licenseType'] = 'Le type de permis est requis';
    }

    if (!licenseNumber) {
      validationErrors['licenseNumber'] = 'Le numéro de permis est requis';
    }

    if (Object.keys(validationErrors).length > 0) {
      return new TestRideValidationError(validationErrors);
    }

    let defaultConcessionName = concessionName;

    if (!concessionName && motorcycleRepository) {
      const motorcycle = await motorcycleRepository.findById(motorcycleId);
      if (motorcycle) {
        defaultConcessionName = motorcycle.concessionName;
      }
    }

    const defaultAdditionalRequirements = additionalRequirements || '';
    const defaultMessage = message || '';

    return new TestRide(
      testRideId,
      concessionId,
      motorcycleId,
      motorcycleName,
      firstName,
      lastName,
      email,
      phoneNumber,
      desiredDate,
      status || TestRideStatus.PENDING,
      riderExperience,
      licenseType,
      licenseNumber,
      hasTrainingCertificate,
      preferredRideTime,
      defaultAdditionalRequirements,
      defaultMessage,
      createdAt || new Date(),
      updatedAt || new Date(),
      defaultConcessionName
    );
  }

  public update(status: TestRideStatus): TestRide {
    return new TestRide(
      this.id,
      this.concessionId,
      this.motorcycleId,
      this.motorcycleName,
      this.firstName,
      this.lastName,
      this.email,
      this.phoneNumber,
      this.desiredDate,
      status,
      this.riderExperience,
      this.licenseType,
      this.licenseNumber,
      this.hasTrainingCertificate,
      this.preferredRideTime,
      this.additionalRequirements,
      this.message,
      this.createdAt,
      new Date(),
      this.concessionName
    );
  }

  public toJSON() {
    return {
      id: this.id,
      concessionId: this.concessionId,
      motorcycleId: this.motorcycleId,
      motorcycleName: this.motorcycleName || 'Moto non spécifiée',
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      desiredDate: this.desiredDate,
      status: this.status,
      riderExperience: this.riderExperience,
      licenseType: this.licenseType,
      licenseNumber: this.licenseNumber,
      hasTrainingCertificate: this.hasTrainingCertificate,
      preferredRideTime: this.preferredRideTime,
      additionalRequirements: this.additionalRequirements,
      message: this.message,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      concessionName: this.concessionName || 'Concession non spécifiée'
    };
  }
}
