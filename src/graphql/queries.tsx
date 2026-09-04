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

export const ADMIN_BOOKINGS = gql`
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

export const GET_PAYMENT_TRANSACTIONS = gql`
 query PaymentTransactions(
  $bookingId: ID
  $customerUserId: ID
  $salonId: ID
  $status: PaymentTransactionStatus
  $paymentType: PaymentTransactionType
  $search: String
) {
  paymentTransactions(
    bookingId: $bookingId
    customerUserId: $customerUserId
    salonId: $salonId
    status: $status
    paymentType: $paymentType
    search: $search
  ) {
    success
    message
    totalCount

    transactions {
      paymentTransactionId
      bookingId

      customerUserId
      customerName

      salonId
      salonName

      razorpayOrderId
      razorpayPaymentId

      amount
      fee
      netAmount
      currency

      paymentType
      paymentMethod
      status

      failureReason

      createdAt
      updatedAt
      paidAt
    }
  }
}
`;

export const GET_ADMIN_BOOKINGS = gql`
  query AdminBookings {
    adminBookings {
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
        createdAt
        totalAmount
        bookingFee
        remainingAmount
        paymentMethod
        paymentStatus
        bookingFeeStatus
        razorpayOrderId
        razorpayPaymentId
        paymentGateway
      }
    }
  }
`;

export const REFUNDS_QUERY = gql`
  query Refunds(
    $bookingId: ID
    $customerUserId: ID
    $salonId: ID
    $status: RefundStatus
    $reason: RefundReason
    $search: String
  ) {
    refunds(
      bookingId: $bookingId
      customerUserId: $customerUserId
      salonId: $salonId
      status: $status
      reason: $reason
      search: $search
    ) {
      success
      message
      totalCount

      refunds {
        refundId
        bookingId
        paymentTransactionId
        customerUserId
        customerName
        customerPhone
        salonId
        salonName
        originalAmount
        refundAmount
        reason
        status
        paymentMethod
        razorpayPaymentId
        razorpayRefundId
        requestedAt
        processedAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const REVENUE_QUERY = gql`
  query RevenueData(
    $search: String
    $bookingStatus: BookingStatus
    $paymentStatus: PaymentStatus
  ) {
    adminBookings(
      search: $search
      bookingStatus: $bookingStatus
      paymentStatus: $paymentStatus
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
        subtotal
        discount
        totalAmount
        paymentMethod
        paymentStatus
        bookingStatus
        bookingFee
        bookingFeeStatus
        bookingFeePaidAt
        remainingAmount
        razorpayOrderId
        razorpayPaymentId
        paymentGateway
        createdAt
        updatedAt
      }
    }

    refunds {
      success
      message
      totalCount
      refunds {
        refundId
        bookingId
        paymentTransactionId
        customerUserId
        customerName
        customerPhone
        salonId
        salonName
        originalAmount
        refundAmount
        reason
        status
        paymentMethod
        razorpayPaymentId
        razorpayRefundId
        requestedAt
        processedAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_LOCATIONS = gql`
  query GetLocations($search: String, $status: LocationStatus) {
    locations(search: $search, status: $status) {
      success
      message
      totalCount
      locations {
        locationId
        city
        state
        country
        pincode
        salons
        customers
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_LOCATION = gql`
  mutation CreateLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      success
      message
      location {
        locationId
        city
        state
        country
        pincode
        salons
        customers
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_LOCATION = gql`
  mutation UpdateLocation($input: UpdateLocationInput!) {
    updateLocation(input: $input) {
      success
      message
      location {
        locationId
        city
        state
        country
        pincode
        salons
        customers
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_LOCATION = gql`
  mutation DeleteLocation($locationId: ID!) {
    deleteLocation(locationId: $locationId) {
      success
      message
      location {
        locationId
        city
        state
        country
        pincode
        salons
        customers
        status
        createdAt
        updatedAt
      }
    }
  }
`;