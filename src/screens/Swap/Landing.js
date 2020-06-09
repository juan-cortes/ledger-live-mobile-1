// @flow
import React from "react";
import { Trans } from "react-i18next";
import SafeAreaView from "react-native-safe-area-view";
import { StyleSheet, View } from "react-native";
import Button from "../../components/Button";
import LText from "../../components/LText";
import IconDonjon from "../../icons/Donjon";
import colors from "../../colors";

const Landing = ({ onContinue }: { onContinue: any }) => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.wrapper}>
        <View style={styles.illustration}>
          <IconDonjon size={96} color="#E59450" />
        </View>
        <LText secondary style={styles.title}>
          <Trans i18nKey="transfer.swap.landing.title" />
        </LText>
        <LText primary style={styles.disclaimer}>
          <Trans i18nKey="transfer.swap.landing.disclaimer" />
        </LText>
      </View>
      <Button
        event="ConfirmSwapLandingDisclaimer"
        type={"primary"}
        title={<Trans i18nKey="common.continue" />}
        onPress={onContinue}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },

  wrapper: {
    flexGrow: 1,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  illustration: {
    height: 148,
    width: 148,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 74,
    backgroundColor: colors.lightGrey,
    color: "#ff0000",
    marginBottom: 24,
  },

  title: {
    fontSize: 18,
    color: colors.darkBlue,
    marginBottom: 8,
  },

  disclaimer: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.smoke,
    textAlign: "center",
  },
});

export default Landing;
