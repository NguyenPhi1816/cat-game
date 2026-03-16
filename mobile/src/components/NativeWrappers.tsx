import React from "react";
import {
  Modal as RNModal,
  RefreshControl as RNRefreshControl,
  RefreshControlProps,
} from "react-native";

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
}

export function Modal(props: React.ComponentProps<typeof RNModal>) {
  const coercedVisible = toBoolean(props.visible, false);
  return <RNModal {...props} visible={coercedVisible} />;
}

export function RefreshControl(props: RefreshControlProps) {
  const coercedRefreshing = toBoolean(props.refreshing, false);
  return <RNRefreshControl {...props} refreshing={coercedRefreshing} />;
}

export default { Modal, RefreshControl };
