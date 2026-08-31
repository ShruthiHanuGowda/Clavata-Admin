import { gql } from '@apollo/client';

export const ADMIN_CUSTOMERS = gql`
    query AdminCustomers(
        $search: String
        $status: CustomerStatus
    ) {
        adminCustomers(
            search: $search
            status: $status
        ) {
            success
            message
            totalCount

            customers {
                userId
                fullName
                phoneNumber
                email

                activeRole
                providerStatus
                salonId
                status

                totalBookings
                completedBookings
                cancelledBookings
                totalSpent
                lastBooking

                createdAt
                updatedAt
            }
        }
    }
`;

export const ADMIN_SALONS = gql`
  query AdminSalons(
    $search: String
    $kycStatus: KycStatus
    $salonStatus: SalonStatus
    $isActive: Boolean
  ) {
    adminSalons(
      search: $search
      kycStatus: $kycStatus
      salonStatus: $salonStatus
      isActive: $isActive
    ) {
      success
      message
      totalCount

      salons {
        salonId
        ownerUserId
        salonName
        ownerName
        businessType
        ownerPhoneNumber
        alternatePhone
        email

        address {
          addressLine
          city
          state
          pincode
        }

        latitude
        longitude

        gstNumber
        panNumber
        aadhaarNumber

        bankAccount
        ifsc
        accountHolderName

        logoUrl
        coverImageUrl
        galleryImages

        kycStatus
        salonStatus

        isActive
        isVisible
        isDeleted

        averageRating
        totalReviews
        totalAppointments
        totalCompletedAppointments
        totalCancelledAppointments
        totalRevenue
        adminApprovalStatus
        approvedBy
        approvedAt
        rejectedBy
        rejectedAt
        rejectionReason

        lastUpdatedBy
        createdAt
        updatedAt
      }
    }
  }
`;

export const APPROVE_SALON = gql`
  mutation AdminApproveSalon($input: AdminApproveSalonInput!) {
    adminApproveSalon(input: $input) {
      success
      message
      salon {
        salonId
        ownerUserId
        salonName
        ownerName
        businessType
        ownerPhoneNumber
        alternatePhone
        email
        address {
          addressLine
          city
          state
          pincode
        }
        latitude
        longitude
        gstNumber
        panNumber
        aadhaarNumber
        bankAccount
        ifsc
        accountHolderName
        logoUrl
        coverImageUrl
        galleryImages
        kycStatus
        adminApprovalStatus
        salonStatus
        isActive
        isVisible
        isDeleted
        averageRating
        totalReviews
        totalAppointments
        totalCompletedAppointments
        totalCancelledAppointments
        totalRevenue
        approvedBy
        approvedAt
        rejectedBy
        rejectedAt
        rejectionReason
        lastUpdatedBy
        createdAt
        updatedAt
      }
    }
  }
`;

export const REJECT_SALON = gql`
  mutation AdminRejectSalon($input: AdminRejectSalonInput!) {
    adminRejectSalon(input: $input) {
      success
      message
      salon {
        salonId
        ownerUserId
        salonName
        ownerName
        businessType
        ownerPhoneNumber
        alternatePhone
        email
        address {
          addressLine
          city
          state
          pincode
        }
        latitude
        longitude
        gstNumber
        panNumber
        aadhaarNumber
        bankAccount
        ifsc
        accountHolderName
        logoUrl
        coverImageUrl
        galleryImages
        kycStatus
        adminApprovalStatus
        salonStatus
        isActive
        isVisible
        isDeleted
        averageRating
        totalReviews
        totalAppointments
        totalCompletedAppointments
        totalCancelledAppointments
        totalRevenue
        approvedBy
        approvedAt
        rejectedBy
        rejectedAt
        rejectionReason
        lastUpdatedBy
        createdAt
        updatedAt
      }
    }
  }
`;
