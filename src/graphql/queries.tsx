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


// export const ADMIN_SALONS = gql`
//   query AdminSalons(
//     $search: String
//     $kycStatus: KycStatus
//     $salonStatus: SalonStatus
//     $isActive: Boolean
//   ) {
//     adminSalons(
//       search: $search
//       kycStatus: $kycStatus
//       salonStatus: $salonStatus
//       isActive: $isActive
//     ) {
//       success
//       message
//       totalCount

//       salons {
//         salonId
//         ownerUserId
//         salonName
//         ownerName
//         businessType
//         ownerPhoneNumber
//         alternatePhone
//         email

//         address {
//           addressLine
//           city
//           state
//           pincode
//         }

//         latitude
//         longitude

//         gstNumber
//         panNumber
//         aadhaarNumber

//         # KYC DOCUMENTS
//         documents {
//           aadhaarFront
//           aadhaarBack
//           panCard
//           gstCertificate
//         }

//         bankAccount
//         ifsc
//         accountHolderName

//         logoUrl
//         coverImageUrl
//         galleryImages

//         kycStatus
//         adminApprovalStatus
//         salonStatus

//         isActive
//         isVisible
//         isDeleted

//         averageRating
//         totalReviews
//         totalAppointments
//         totalCompletedAppointments
//         totalCancelledAppointments
//         totalRevenue

//         approvedBy
//         approvedAt
//         rejectedBy
//         rejectedAt
//         rejectionReason

//         lastUpdatedBy
//         createdAt
//         updatedAt
//       }
//     }
//   }
// `;

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
        ownerName
        ownerPhoneNumber
        alternatePhone
        email

        salonName
        businessType

        logoUrl
        coverImageUrl
        galleryImages

        address {
          addressLine
          city
          state
          pincode
        }

        latitude
        longitude

        businessHours {
          MONDAY {
            isOpen
            open
            close
          }
          TUESDAY {
            isOpen
            open
            close
          }
          WEDNESDAY {
            isOpen
            open
            close
          }
          THURSDAY {
            isOpen
            open
            close
          }
          FRIDAY {
            isOpen
            open
            close
          }
          SATURDAY {
            isOpen
            open
            close
          }
          SUNDAY {
            isOpen
            open
            close
          }
        }

        # IMPORTANT
        # This was missing from the Pending Approvals query
        serviceSelections {
          categoryId
          categoryName
          subcategoryId
          subcategoryName
        }

        kycStatus
        adminApprovalStatus

        aadhaarNumber
        panNumber
        gstNumber

        documents {
          aadhaarFront
          aadhaarBack
          panCard
          gstCertificate
        }

        bankAccount
        ifsc
        accountHolderName

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
        clavataAmount
        salonAmount
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
export const PROCESS_REFUND_MUTATION = gql`
  mutation ProcessRefund($refundId: ID!) {
    processRefund(refundId: $refundId) {
      success
      message

      refund {
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
        clavataAmount
        salonAmount
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

export const GET_CATEGORIES = gql`
  query GetCategories(
    $search: String
    $status: CategoryStatus
  ) {
    categories(
      search: $search
      status: $status
    ) {
      success
      message
      totalCount

      categories {
        categoryId
        name
        description
        servicesCount
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $input: CreateCategoryInput!
  ) {
    createCategory(input: $input) {
      success
      message

      category {
        categoryId
        name
        description
        servicesCount
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory(
    $input: UpdateCategoryInput!
  ) {
    updateCategory(input: $input) {
      success
      message

      category {
        categoryId
        name
        description
        servicesCount
        status
        createdAt
        updatedAt
      }
    }
  }
`;
export const DELETE_CATEGORY = gql`
  mutation DeleteCategory(
    $categoryId: ID!
  ) {
    deleteCategory(
      categoryId: $categoryId
    ) {
      success
      message

      category {
        categoryId
        name
        description
        servicesCount
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const ADMIN_OFFERS = gql`
  query AdminOffers(
    $search: String
    $status: OfferStatus
    $salonId: ID
  ) {
    adminOffers(
      search: $search
      status: $status
      salonId: $salonId
    ) {
      success
      message
      totalCount

      offers {
        offerId
        salonId
        salonName

        title
        description

        discountType
        discountValue

        couponCode
        minimumBookingAmount

        category
        serviceIds

        startDate
        endDate

        usageLimit
        usageCount
        customerLimit

        status
        rejectionReason

        approvedBy
        approvedAt

        rejectedBy
        rejectedAt

        createdAt
        updatedAt
      }
    }
  }
`;

export const ADMIN_APPROVE_OFFER = gql`
  mutation AdminApproveOffer(
    $input: AdminApproveOfferInput!
  ) {
    adminApproveOffer(input: $input) {
      success
      message

      offer {
        offerId
        salonId
        salonName

        title
        description

        discountType
        discountValue

        couponCode
        minimumBookingAmount

        category
        serviceIds

        startDate
        endDate

        usageLimit
        usageCount
        customerLimit

        status
        rejectionReason

        approvedBy
        approvedAt

        rejectedBy
        rejectedAt

        createdAt
        updatedAt
      }
    }
  }
`;

export const ADMIN_REJECT_OFFER = gql`
  mutation AdminRejectOffer(
    $input: AdminRejectOfferInput!
  ) {
    adminRejectOffer(input: $input) {
      success
      message

      offer {
        offerId
        salonId
        salonName

        title
        status
        rejectionReason
        rejectedBy
        rejectedAt
        updatedAt
      }
    }
  }
`;


// ============================================================
// GET SALON
// ============================================================

export const GET_SALON = gql`
    query GetSalon($salonId: ID!) {
        getSalon(salonId: $salonId) {
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

            logoUrl
            coverImageUrl
            galleryImages

            businessHours

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

            createdAt
            updatedAt
        }
    }
`;


// ============================================================
// UPDATE SALON PROFILE
// ============================================================

export const UPDATE_SALON_PROFILE = gql`
    mutation UpdateSalonProfile(
        $input: UpdateSalonProfileInput!
    ) {
        updateSalonProfile(input: $input) {
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

                createdAt
                updatedAt
            }
        }
    }
`;


// ============================================================
// S3 UPLOAD URL
// ============================================================

export const GENERATE_SALON_MEDIA_UPLOAD_URL = gql`
    mutation GenerateSalonMediaUploadUrl(
        $input: GenerateSalonMediaUploadUrlInput!
    ) {
        generateSalonMediaUploadUrl(
            input: $input
        ) {
            success
            message
            uploadUrl
            objectUrl
            key
            salonId
            mediaType
            contentType
            imageId
            expiresIn
        }
    }
`;


// ============================================================
// S3 DELETE
// ============================================================

export const DELETE_SALON_MEDIA = gql`
    mutation DeleteSalonMedia(
        $input: DeleteSalonMediaInput!
    ) {
        deleteSalonMedia(
            input: $input
        ) {
            success
            message
            key
        }
    }
`;

export const ADMIN_SALON_PROFILE_CHANGES = gql`
  query AdminSalonProfileChanges(
    $status: SalonProfileChangeStatus
  ) {
    adminSalonProfileChanges(
      status: $status
    ) {
      success
      message
      totalCount

      changes {
        changeId
        salonId
        salonName
        ownerName
        businessType
        email
        ownerPhoneNumber
        alternatePhone

        address {
          addressLine
          city
          state
          pincode
        }

        logoUrl
        coverImageUrl
        galleryImages

        logoMedia {
          imageId
          salonId
          mediaType
          key
          objectUrl
          status
          uploadedAt
          approvedAt
          approvedBy
          rejectedAt
          rejectedBy
          rejectionReason
        }

        coverMedia {
          imageId
          salonId
          mediaType
          key
          objectUrl
          status
          uploadedAt
          approvedAt
          approvedBy
          rejectedAt
          rejectedBy
          rejectionReason
        }

        galleryMedia {
          imageId
          salonId
          mediaType
          key
          objectUrl
          status
          uploadedAt
          approvedAt
          approvedBy
          rejectedAt
          rejectedBy
          rejectionReason
        }

        status
        submittedBy
        submittedAt
        reviewedBy
        reviewedAt
        rejectionReason

        previousProfile {
          salonName
          ownerName
          businessType
          email
          ownerPhoneNumber
          alternatePhone

          address {
            addressLine
            city
            state
            pincode
          }
        }

        requestedProfile {
          salonName
          ownerName
          businessType
          email
          ownerPhoneNumber
          alternatePhone

          address {
            addressLine
            city
            state
            pincode
          }
        }

        changes {
          field
          label
          oldValue
          newValue
          changeType
        }

        changedFields
        changeCount
      }
    }
  }
`;

export const ADMIN_APPROVE_SALON_PROFILE_CHANGE = gql`
  mutation AdminApproveSalonProfileChange(
    $input: AdminApproveSalonProfileChangeInput!
  ) {
    adminApproveSalonProfileChange(input: $input) {
      success
      message
      change {
        changeId
        salonId
        salonName
        status
        submittedAt
        reviewedBy
        reviewedAt
        rejectionReason
      }
    }
  }
`;

export const ADMIN_REJECT_SALON_PROFILE_CHANGE = gql`
  mutation AdminRejectSalonProfileChange(
    $input: AdminRejectSalonProfileChangeInput!
  ) {
    adminRejectSalonProfileChange(input: $input) {
      success
      message
      change {
        changeId
        salonId
        salonName
        status
        submittedAt
        reviewedBy
        reviewedAt
        rejectionReason
      }
    }
  }
`;

// ======================================================
// GET SUBCATEGORIES
// ======================================================

export const GET_SUBCATEGORIES = gql`
  query GetSubcategories(
    $categoryId: ID
    $search: String
    $status: SubcategoryStatus
  ) {
    subcategories(
      categoryId: $categoryId
      search: $search
      status: $status
    ) {
      success
      message
      totalCount

      subcategories {
        subcategoryId
        categoryId
        name
        description
        servicesCount
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// ======================================================
// CREATE SUBCATEGORY
// ======================================================

export const CREATE_SUBCATEGORY = gql`
  mutation CreateSubcategory(
    $input: CreateSubcategoryInput!
  ) {
    createSubcategory(
      input: $input
    ) {
      success
      message

      subcategory {
        subcategoryId
        categoryId
        name
        description
        servicesCount
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// ======================================================
// UPDATE SUBCATEGORY
// ======================================================

export const UPDATE_SUBCATEGORY = gql`
  mutation UpdateSubcategory(
    $input: UpdateSubcategoryInput!
  ) {
    updateSubcategory(
      input: $input
    ) {
      success
      message

      subcategory {
        subcategoryId
        categoryId
        name
        description
        servicesCount
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// ======================================================
// DELETE SUBCATEGORY
// ======================================================

export const DELETE_SUBCATEGORY = gql`
  mutation DeleteSubcategory(
    $subcategoryId: ID!
  ) {
    deleteSubcategory(
      subcategoryId: $subcategoryId
    ) {
      success
      message

      subcategory {
        subcategoryId
        categoryId
        name
        description
        servicesCount
        status
        createdAt
        updatedAt
      }
    }
  }
`;
