/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

"use client";

import React, { PropsWithChildren } from "react";

export interface ErrorBoundaryContentProps {
  error: Error;
  reset: () => void;
}

type Props = PropsWithChildren<{ Component: React.ComponentType<ErrorBoundaryContentProps>; pathname: string }>;

interface State {
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { error: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { error };
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.pathname !== prevProps.pathname) {
      this.reset();
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log(error, errorInfo);
  }

  reset = () => {
    this.setState({ error: undefined });
  };

  render() {
    if (this.state.error) {
      return (
        <this.props.Component
          error={this.state.error}
          reset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

