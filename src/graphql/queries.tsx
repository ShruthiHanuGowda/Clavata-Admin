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

        # KYC DOCUMENTS
        documents {
          aadhaarFront
          aadhaarBack
          panCard
          gstCertificate
        }

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
const ADMIN_BOOKINGS = gql`
  query AdminBookings(
    $search: String
    $bookingStatus: BookingStatus
    $paymentStatus: PaymentStatus
    $salonId: ID
  ) {
    adminBookings(
      search: $search
      bookingStatus: $bookingStatus
      paymentStatus: $paymentStatus
      salonId: $salonId
    ) {
      success
      message
      totalCount

      bookings {
        bookingId
        salonId
        customerUserId

        salonName
        customerName
        customerPhone

        bookingDate
        startTime
        endTime

        staffId
        staffName

        services {
          serviceId
          name
          category
          duration
          price
        }

        totalDuration
        subtotal
        discount
        totalAmount

        paymentMethod
        paymentStatus

        bookingStatus

        notes
        salonNote

        bookingFee
        bookingFeeStatus
        bookingFeePaidAt

        remainingAmount

        razorpayOrderId
        razorpayPaymentId
        paymentGateway

        reviewSubmitted
        rating
        review
        reviewedAt

        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($input: UpdateBookingStatusInput!) {
    updateBookingStatus(input: $input) {
      success
      message

      booking {
        bookingId
        salonId
        customerUserId

        salonName
        customerName
        customerPhone

        bookingDate
        startTime
        endTime

        staffId
        staffName

        services {
          serviceId
          name
          category
          duration
          price
        }

        totalDuration
        subtotal
        discount
        totalAmount

        paymentMethod
        paymentStatus
        bookingStatus

        notes
        salonNote

        bookingFee
        bookingFeeStatus
        bookingFeePaidAt
        remainingAmount

        razorpayOrderId
        razorpayPaymentId
        paymentGateway

        reviewSubmitted
        rating
        review
        reviewedAt

        createdAt
        updatedAt
      }
    }
  }
`;

export const ADMIN_REVIEWS = gql`
  query AdminReviews(
    $search: String
    $rating: Int
    $status: ReviewStatus
    $salonId: ID
  ) {
    adminReviews(
      search: $search
      rating: $rating
      status: $status
      salonId: $salonId
    ) {
      success
      message
      totalCount

      reviews {
        reviewId
        bookingId
        salonId
        salonName
        customerUserId
        customerName
        rating
        review
        createdAt
        status
      }
    }
  }
`;

export const UPDATE_REVIEW_STATUS = gql`
  mutation UpdateReviewStatus(
    $input: UpdateReviewStatusInput!
  ) {
    updateReviewStatus(input: $input) {
      success
      message

      review {
        reviewId
        bookingId
        salonId
        salonName
        customerUserId
        customerName
        rating
        review
        createdAt
        status
      }
    }
  }
`;