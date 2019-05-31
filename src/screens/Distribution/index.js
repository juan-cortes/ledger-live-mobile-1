/* @flow */
import React, { PureComponent } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { Trans, translate } from "react-i18next";
import { View, StyleSheet } from "react-native";
// $FlowFixMe
import { FlatList, SafeAreaView } from "react-navigation";
import type { NavigationScreenProp } from "react-navigation";
import i18next from "i18next";
import { getAssetsDistribution } from "@ledgerhq/live-common/lib/portfolio";
import { createStructuredSelector } from "reselect";
import type { AssetsDistribution } from "@ledgerhq/live-common/lib/types/portfolio";
import type { Currency } from "@ledgerhq/live-common/lib/types/currencies";
import type { T } from "../../types/common";
import TrackScreen from "../../analytics/TrackScreen";
import { accountsSelector } from "../../reducers/accounts";
import DistributionCard from "./DistributionCard";
import LText from "../../components/LText";
import type { DistributionItem } from "./DistributionCard";
import {
  counterValueCurrencySelector,
  counterValueExchangeSelector,
  currencySettingsSelector,
  intermediaryCurrency,
} from "../../reducers/settings";
import CounterValues from "../../countervalues";
import colors from "../../colors";
import RingChart from "./RingChart";
import CurrencyUnitValue from "../../components/CurrencyUnitValue";

type Props = {
  navigation: NavigationScreenProp<*>,
  distribution: AssetsDistribution,
  counterValueCurrency: Currency,
  t: T,
};
const mapStateToProps = createStructuredSelector({
  distribution: state => {
    const accounts = accountsSelector(state);
    const counterValueCurrency = counterValueCurrencySelector(state);
    const toExchange = counterValueExchangeSelector(state);
    return getAssetsDistribution(accounts, (currency: Currency, value) => {
      // $FlowFixMe
      const currencySettings = currencySettingsSelector(state, { currency });
      const fromExchange = currencySettings.exchange;
      return CounterValues.calculateWithIntermediarySelector(state, {
        from: currency,
        fromExchange,
        intermediary: intermediaryCurrency,
        toExchange,
        to: counterValueCurrency,
        value,
        disableRounding: true,
      });
    });
  },
  counterValueCurrency: counterValueCurrencySelector,
});

class Distribution extends PureComponent<Props, *> {
  state = {
    highlight: "",
  };
  static navigationOptions = {
    title: i18next.t("distribution.header"),
    headerLeft: null,
  };

  renderItem = ({ item, index }: { item: DistributionItem }) => (
    <DistributionCard
      item={item}
      highlighting={index === this.state.highlight}
    />
  );

  selectedKey = index => {
    this.setState({ highlight: index });
    console.log("selected id", index);
    if (typeof index === "number") {
      this.flatListRef.scrollToIndex({ index });
    }
  };

  keyExtractor = item => item.id;

  ListHeaderComponent = () => {
    const { counterValueCurrency, distribution } = this.props;

    return (
      <View>
        <View style={styles.header}>
          <View style={styles.chartWrapper}>
            <RingChart
              selectedKey={this.selectedKey}
              data={distribution.list}
            />
            <View style={styles.assetWrapper}>
              <LText tertiary style={styles.assetCount}>
                {distribution.list.length}
              </LText>
              <LText tertiary style={styles.assets}>
                <Trans i18nKey="distribution.assets" />
              </LText>
            </View>
          </View>
          <View>
            <LText tertiary style={styles.label}>
              <Trans i18nKey="distribution.total" />
            </LText>
            <LText tertiary style={styles.amount}>
              <CurrencyUnitValue
                unit={counterValueCurrency.units[0]}
                value={distribution.sum}
              />
            </LText>
          </View>
        </View>
        <LText bold secondary style={styles.distributionTitle}>
          <Trans i18nKey="distribution.list" />
        </LText>
      </View>
    );
  };

  render() {
    const { distribution } = this.props;

    const Header = this.ListHeaderComponent;
    return (
      <SafeAreaView style={styles.wrapper}>
        <TrackScreen category="Distribution" />
        <Header />
        <FlatList
          ref={ref => {
            this.flatListRef = ref;
          }}
          data={distribution.list}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          style={styles.root}
        />
      </SafeAreaView>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps),
)(Distribution);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  root: {
    padding: 16,
    flex: 1,
    backgroundColor: colors.lightGrey,
    paddingBottom: 16,
  },
  distributionTitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.darkBlue,
    marginBottom: 8,
    marginLeft: 16,
  },
  header: {
    backgroundColor: colors.white,
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
  },
  chartWrapper: {
    height: 180,
    width: 180,
    marginRight: 15,
  },

  assetWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  assetCount: {
    fontSize: 27,
    color: colors.darkBlue,
  },

  assets: {
    color: colors.darkBlue,
  },

  label: {
    fontSize: 14,
    color: colors.smoke,
  },

  amount: {
    fontSize: 22,
    color: colors.darkBlue,
  },
});
