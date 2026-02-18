import gql from 'graphql-tag';
import { QueryOptions, requester, sdk } from '../../graphqlWrapper';
import { ErrorCode, PaymentInput } from '~/generated/graphql';

export function getAvailableCountries(options: QueryOptions) {
  return sdk.availableCountries({}, options);
}

export function getEligibleShippingMethods(options: QueryOptions) {
  return sdk.eligibleShippingMethods({}, options);
}

export function getEligiblePaymentMethods(options: QueryOptions) {
  return sdk.eligiblePaymentMethods({}, options);
}

export function generateBraintreeClientToken(options: QueryOptions) {
  return sdk.generateBraintreeClientToken({}, options);
}

type RazorpayOrderIdSuccess = {
  __typename: 'RazorpayOrderIdSuccess';
  razorpayOrderId: string;
};

type RazorpayOrderIdGenerationError = {
  __typename: 'RazorpayOrderIdGenerationError';
  errorCode: ErrorCode;
  message: string;
};

type GenerateRazorpayOrderIdResult =
  | RazorpayOrderIdSuccess
  | RazorpayOrderIdGenerationError;

type GenerateRazorpayOrderIdMutation = {
  generateRazorpayOrderId: GenerateRazorpayOrderIdResult;
};

type GenerateRazorpayOrderIdMutationVariables = {
  orderId: string;
};

export function generateRazorpayOrderId(
  orderId: string,
  options: QueryOptions,
) {
  return requester<
    GenerateRazorpayOrderIdMutation,
    GenerateRazorpayOrderIdMutationVariables
  >(
    GenerateRazorpayOrderIdDocument,
    { orderId },
    { request: options.request },
  );
}

export function getNextOrderStates(options: QueryOptions) {
  return sdk.nextOrderStates({}, options);
}

export function addPaymentToOrder(input: PaymentInput, options: QueryOptions) {
  return sdk.addPaymentToOrder({ input }, options);
}

export function transitionOrderToState(state: string, options: QueryOptions) {
  return sdk.transitionOrderToState({ state }, options);
}

gql`
  query eligibleShippingMethods {
    eligibleShippingMethods {
      id
      name
      description
      metadata
      price
      priceWithTax
    }
  }
`;

gql`
  query eligiblePaymentMethods {
    eligiblePaymentMethods {
      id
      code
      name
      description
      eligibilityMessage
      isEligible
    }
  }
`;

gql`
  query nextOrderStates {
    nextOrderStates
  }
`;

gql`
  query availableCountries {
    availableCountries {
      id
      name
      code
    }
  }
`;

gql`
  mutation addPaymentToOrder($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation transitionOrderToState($state: String!) {
    transitionOrderToState(state: $state) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  query generateBraintreeClientToken {
    generateBraintreeClientToken
  }
`;

const GenerateRazorpayOrderIdDocument = gql`
  mutation generateRazorpayOrderId($orderId: ID!) {
    generateRazorpayOrderId(orderId: $orderId) {
      __typename
      ... on RazorpayOrderIdSuccess {
        razorpayOrderId
      }
      ... on RazorpayOrderIdGenerationError {
        errorCode
        message
      }
    }
  }
`;
