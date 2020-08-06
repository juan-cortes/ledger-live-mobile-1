// @flow

import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Trans } from "react-i18next";
import { useSelector } from "react-redux";
import uniq from "lodash/uniq";
import {
  findCryptoCurrencyById,
  isCurrencySupported,
} from "@ledgerhq/live-common/lib/data/cryptocurrencies";
import { getCurrenciesWithStatus } from "@ledgerhq/live-common/lib/swap/logic";
import type { CurrenciesStatus } from "@ledgerhq/live-common/lib/swap/logic";
import type {
  Exchange,
  ExchangeRate,
} from "@ledgerhq/live-common/lib/swap/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/dist/Ionicons";
import {
  getAccountUnit,
  getAccountCurrency,
} from "@ledgerhq/live-common/lib/account";
import type {
  Currency,
  Transaction,
  TransactionStatus,
} from "@ledgerhq/live-common/lib/types";
import { findTokenById } from "@ledgerhq/live-common/lib/data/tokens";
import type { DeviceInfo } from "@ledgerhq/live-common/lib/types/manager";
import type { DeviceModel } from "@ledgerhq/devices";
import CurrencyUnitValue from "../../../components/CurrencyUnitValue";

import SectionSeparator, {
  ArrowDownCircle,
} from "../../../components/SectionSeparator";
import CurrencyIcon from "../../../components/CurrencyIcon";
import LText from "../../../components/LText";
import Button from "../../../components/Button";
import { accountsSelector } from "../../../reducers/accounts";
import { ScreenName } from "../../../const";
import colors from "../../../colors";

type SelectAccountFlowTarget = "from" | "to";
export type SwapRouteParams = {
  exchange: Exchange,
  exchangeRate: ExchangeRate,
  currenciesStatus: CurrenciesStatus,
  selectableCurrencies: Currency[],
  transaction?: Transaction,
  status?: TransactionStatus,
  selectedCurrency?: Currency,
  providers: any,
  installedApps: any,
  target: "from" | "to",
  deviceMeta: DeviceMeta,
};

type DeviceMeta = {
  appRes: { installed: any },
  deviceId: string,
  deviceInfo: DeviceInfo,
  deviceName: string,
  modelId: DeviceModel,
  wired: boolean,
};
const Form = ({
  providers,
  deviceMeta,
}: {
  providers: any,
  deviceMeta: DeviceMeta,
}) => {
  const { navigate } = useNavigation();
  const { appRes } = deviceMeta;
  const { installed: installedApps } = appRes;
  const route = useRoute();
  const accounts = useSelector(accountsSelector);
  const selectableCurrencies = useSelector(state =>
    selectableCurrenciesSelector(state, { providers }),
  );
  const currenciesStatus = useMemo(
    () =>
      getCurrenciesWithStatus({
        accounts,
        installedApps,
        selectableCurrencies,
      }),
    [accounts, installedApps, selectableCurrencies],
  );
  const { exchange } = route.params || {};
  const { fromAccount, toAccount } = exchange || {};
  const fromCurrency = fromAccount ? getAccountCurrency(fromAccount) : null;
  const toCurrency = toAccount ? getAccountCurrency(toAccount) : null;

  const startSelectAccountFlow = useCallback(
    (target: SelectAccountFlowTarget) => {
      navigate(ScreenName.SwapFormSelectCrypto, {
        target,
        providers,
        installedApps,
        exchange: exchange || {},
        selectableCurrencies,
        currenciesStatus,
      });
    },
    [
      navigate,
      providers,
      installedApps,
      exchange,
      selectableCurrencies,
      currenciesStatus,
    ],
  );

  const onContinue = useCallback(() => {
    navigate(ScreenName.SwapFormAmount, {
      ...route.params,
      deviceMeta,
    });
  }, [navigate, deviceMeta, route.params]);

  const canContinue = useMemo(() => {
    if (!exchange) return false;
    const { fromAccount, toAccount } = exchange;
    return fromAccount && toAccount;
  }, [exchange]);

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <TouchableOpacity
          style={styles.accountWrapper}
          onPress={() => startSelectAccountFlow("from")}
        >
          <LText semiBold secondary style={styles.accountTitle}>
            <Trans i18nKey={"transfer.swap.form.from"} />
          </LText>

          <View style={styles.accountNameWrapper}>
            {fromAccount ? (
              <>
                <CurrencyIcon size={16} currency={fromCurrency} />
                <LText semiBold style={styles.accountName}>
                  {fromAccount.name}
                </LText>
                <View style={{ marginTop: 4, marginLeft: 8 }}>
                  <Icon name="ios-arrow-down" size={16} color={colors.black} />
                </View>
              </>
            ) : (
              <>
                <LText semiBold style={styles.accountName}>
                  <Trans i18nKey={"transfer.swap.form.fromAccount"} />
                </LText>
                <View style={{ marginTop: 4, marginLeft: 8 }}>
                  <Icon name="ios-arrow-down" size={16} color={colors.black} />
                </View>
              </>
            )}
          </View>

          {fromAccount ? (
            <LText style={styles.accountBalance}>
              <Trans i18nKey={"transfer.swap.form.balance"}>
                <CurrencyUnitValue
                  showCode
                  unit={getAccountUnit(fromAccount)}
                  value={fromAccount.balance}
                />
              </Trans>
            </LText>
          ) : null}
        </TouchableOpacity>
        <SectionSeparator noMargin>
          <ArrowDownCircle />
        </SectionSeparator>
        <TouchableOpacity
          style={styles.accountWrapper}
          onPress={() => startSelectAccountFlow("to")}
        >
          <LText semiBold secondary style={styles.accountTitle}>
            <Trans i18nKey={"transfer.swap.form.to"} />
          </LText>

          <View style={styles.accountNameWrapper}>
            {toAccount ? (
              <>
                <CurrencyIcon size={16} currency={toCurrency} />
                <LText semiBold style={styles.accountName}>
                  {toAccount.name}
                </LText>
                <View style={{ marginTop: 4, marginLeft: 8 }}>
                  <Icon name="ios-arrow-down" size={16} color={colors.black} />
                </View>
              </>
            ) : (
              <>
                <LText semiBold style={styles.accountName}>
                  <Trans i18nKey={"transfer.swap.form.toAccount"} />
                </LText>
                <View style={{ marginTop: 4, marginLeft: 8 }}>
                  <Icon name="ios-arrow-down" size={16} color={colors.black} />
                </View>
              </>
            )}
          </View>

          {toAccount ? (
            <LText style={styles.accountBalance}>
              <Trans i18nKey={"transfer.swap.form.balance"}>
                <CurrencyUnitValue
                  showCode
                  unit={getAccountUnit(toAccount)}
                  value={toAccount.balance}
                />
              </Trans>
            </LText>
          ) : null}
        </TouchableOpacity>
      </View>
      <View style={styles.buttonWrapper}>
        <Button
          event="SwapFormAccountToAmount"
          disabled={!canContinue}
          type={"primary"}
          title={<Trans i18nKey="transfer.swap.form.button" />}
          onPress={onContinue}
          containerStyle={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  top: {
    justifyContent: "space-around",
    marginVertical: 24,
    alignItems: "center",
    flex: 1,
  },
  buttonWrapper: {},
  button: {
    width: "100%",
  },
  accountWrapper: {
    alignItems: "center",
  },
  accountTitle: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.smoke,
  },
  accountNameWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    marginTop: 24,
  },
  accountName: {
    fontSize: 18,
    lineHeight: 25,
    marginLeft: 8,
  },
  accountBalance: {
    fontSize: 14,
    lineHeight: 19,
    color: colors.grey,
  },
});

const selectableCurrenciesSelector = (state, props: { providers: any }) => {
  const { providers } = props;
  const allIds = uniq(
    providers.reduce(
      (ac, { supportedCurrencies }) => [...ac, ...supportedCurrencies],
      [],
    ),
  );

  const tokenCurrencies = allIds.map(findTokenById).filter(Boolean);
  const cryptoCurrencies = allIds
    .map(findCryptoCurrencyById)
    .filter(Boolean)
    .filter(isCurrencySupported); // TODO filter for swapSupported currencies, is this not handled in backend?
  return [...cryptoCurrencies, ...tokenCurrencies];
};

export default Form;