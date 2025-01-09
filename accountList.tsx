import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { encode } from "base-64";

import "./accountList.scss";

import {
  useAppDispatch,
  useAppSelector,
} from "../../../../store/hooks/storeHooks";
import {
  AddUpdateOMSNoteRequest,
  SelectedAccount,
} from "../../../../store/services/accountServices/account.model";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Switch } from "@progress/kendo-react-inputs";
import { Card, CardBody } from "@progress/kendo-react-layout";
import {
  clientApi,
  useGetAllAccountsWithTotalAndAllClientTypesQuery,
  useGetAllClientAccountsWithExtraFieldsQuery,
} from "../../../../store/services/clientServices/clientService";
import { useAddUpdateOMSNoteMutation } from "../../../../store/services/accountServices/accountService";

import AddUpdateAccountDialog from "../../../shared/dialogs/addUpdateAccountDialog/addUpdateAccountDialog";
import AccountListGrid from "../../../shared/grid/accountListGrid/accountListGrid";
import AddNewTextAreaDialog from "../../../shared/dialogs/addNewTextAreaDialog/addNewTextAreaDialog";

import { Permissions } from "../../../../routings/permissions";
import { useNotification } from "../../../../utils/notificationService/notificationService";
import { handleServerError } from "../../../../utils/errorHandling/errorHandler";

import {
  plusCircleIcon,
  plusIcon,
  detailSectionIcon,
  dollarIcon,
  signatureIcon,
  groupSectionIcon,
  listOrderedIcon,
} from "@progress/kendo-svg-icons";
import { Skeleton } from "@progress/kendo-react-all";

const contextMenuItems = [
  {
    text: "Create New Account",
    data: "createNewAccount",
    route: "",
    svgIcon: plusCircleIcon,
    permission: Permissions.Account.Add,
    showForTotal: false,
  },
  {
    text: "Modify Account",
    data: "modifyAccount",
    route: "",
    svgIcon: signatureIcon,
    permission: Permissions.Account.Update,
    showForTotal: false,
  },
  {
    text: "Bank Details",
    data: "bankDetails",
    route: "/operations/accounts/bankDetails",
    svgIcon: detailSectionIcon,
    showForTotal: false,
  },
  {
    text: "Bank Fees",
    data: "bankFees",
    route: "/operations/accounts/bankFees",
    svgIcon: dollarIcon,
    showForTotal: false,
  },
  {
    text: "Old Bank Details",
    data: "oldBankDetails",
    route: "/operations/accounts/oldBankDetails",
    svgIcon: groupSectionIcon,
    showForTotal: false,
  },
  {
    text: "Rankings",
    data: "rankings",
    route: "/operations/accounts/accountRanking",
    svgIcon: listOrderedIcon,
    permission: Permissions.Account.View,
    showForTotal: true,
  },
  {
    text: "OMS Note",
    data: "note",
    route: "",
    svgIcon: plusIcon,
    permission: Permissions.Account.View,
    showForTotal: false,
  },
];

const AccountList = ({ selectedClient }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth);
  const [showAddUpdateAccountDialog, setShowAddUpdateAccountDialog] =
    useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SelectedAccount>(null);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [showAddUpdateOMSNoteDialog, setShowAddUpdateOMSNoteDialog] = useState({
    visible: null,
    currentValue: null,
  });
  const [addUpdateOMSNote] = useAddUpdateOMSNoteMutation();
  const { addNotifications } = useNotification();
  const isTotalClient =
    selectedClient?.clientType === "A" || selectedClient?.clientType === "T";

  const { data: accountsData, isLoading: isAccountDataLoading } =
    useGetAllClientAccountsWithExtraFieldsQuery(
      {
        clientId: selectedClient?.clientID,
        activeFlag: showAll,
        doNotIncludeAccountId: 0,
      },
      {
        skip: !selectedClient && isTotalClient,
      }
    );

  const {
    data: allAndTotalClientAccounts,
    isLoading: isAllAndTotalClientAccountsLoading,
  } = useGetAllAccountsWithTotalAndAllClientTypesQuery(
    selectedClient?.clientID,
    {
      skip: !selectedClient && !isTotalClient,
    }
  );

  const onSelectionChange = (event: any) => {
    setSelectedAccount(event.dataItem);
  };
  const handleShowAllChange = () => {
    setShowAll((prev) => !prev);
  };
  const handleBankDetailsClick = () => {
    if (selectedAccount)
      navigate(
        `/operations/accounts/bankDetails/${encode(
          selectedAccount.accountID.toString()
        )}`,
        {
          state: {
            id: selectedAccount.accountID,
            client: selectedClient,
          },
        }
      );
    else {
      addNotifications("Please Select an account", "warning");
    }
  };
  const handleBankFeesClick = () => {
    if (selectedAccount)
      navigate(
        `/operations/accounts/bankFees/${encode(
          selectedAccount.accountID.toString()
        )}`,
        {
          state: {
            id: selectedAccount.accountID,
            client: selectedClient,
          },
        }
      );
    else {
      addNotifications("Please Select an account", "warning");
    }
  };
  const handleItemSelected = (data: string, selectedRow: SelectedAccount) => {
    setSelectedAccount(selectedRow);

    if (data === "createNewAccount") {
      setShowAddUpdateAccountDialog(true);
      return;
    } else if (data === "modifyAccount") {
      setIsEdit(true);
      setShowAddUpdateAccountDialog(true);
      return;
    } else if (data === "note") {
      setShowAddUpdateOMSNoteDialog((prev: any) => ({
        ...prev,
        visible: true,
        currentValue: selectedRow?.omsNote,
      }));
    } else {
      const items = contextMenuItems.find((x) => x.data === data);
      navigate(
        items.route +
          `/${encode(isTotalClient ? "0" : selectedRow?.accountID.toString())}`,
        {
          state: {
            id: isTotalClient ? 0 : selectedRow?.accountID,
            client: selectedClient,
          },
        }
      );
    }
  };
  const handleDialogClosed = () => {
    setIsEdit(false);
    setShowAddUpdateAccountDialog(false);
  };
  const handleAccountAddded = () => {
    setIsEdit(false);
    setShowAddUpdateAccountDialog(false);
    dispatch(clientApi.util.invalidateTags(["detailedAccounts"]));
  };

  const handleAddUpdateOMSDialog = (value: string) => {
    const request: AddUpdateOMSNoteRequest = {
      note: value,
      accountId: selectedAccount?.accountID,
    };
    addUpdateOMSNote(request)
      .unwrap()
      .then((response) => {
        if (response?.succeeded) {
          addNotifications(response?.messages.join(", "), "success");
        }
      })
      .catch((error) => {
        const errors = handleServerError(error);
        addNotifications(errors, "error");
      });

    dispatch(clientApi.util.invalidateTags(["detailedAccounts"]));
    setShowAddUpdateOMSNoteDialog((prev: any) => ({
      ...prev,
      visible: false,
      currentValue: null,
    }));
  };

  const handleOMSDialogClose = () => {
    setShowAddUpdateOMSNoteDialog((prev: any) => ({
      ...prev,
      visible: false,
      currentValue: null,
    }));
  };
  if (isAccountDataLoading || isAllAndTotalClientAccountsLoading) {
    return (
      <>
        <Skeleton shape="rectangle" className="account-checkbox-loader" />
        <Skeleton shape="rectangle" className="account-grid-loader" />
      </>
    );
  }

  return (
    <>
      <div className="account-Section">
        <Card>
          <CardBody className="account-Filter-section">
            <div>
              <Switch onChange={handleShowAllChange} value={showAll} />
              <span>Show All</span>
            </div>
            <Checkbox
              label={"Active"}
              checked={selectedAccount?.activeFlag ?? false}
            />
            <Checkbox
              label={"144A"}
              checked={selectedAccount?.rule144A ?? false}
            />
            <Checkbox
              label={"US Beneficiary"}
              checked={selectedAccount?.usBeneficiary ?? false}
            />
            <Checkbox
              label={"Taxable"}
              checked={selectedAccount?.taxable ?? false}
            />
            <Checkbox label={"LPOA"} checked={selectedAccount?.lpoa ?? false} />
            <Checkbox
              label={"Retirement Acc."}
              checked={selectedAccount?.retirementAccount ?? false}
            />
            <Button
              svgIcon={detailSectionIcon}
              fillMode="outline"
              themeColor={"primary"}
              size="small"
              onClick={handleBankDetailsClick}
              className={
                Permissions.checkPermission(
                  currentUser?.user,
                  Permissions.Account.View
                ) && !isTotalClient
                  ? ""
                  : "display-none"
              }
            >
              Bank Details
            </Button>
            <Button
              svgIcon={plusCircleIcon}
              fillMode="outline"
              themeColor={"primary"}
              size="small"
              onClick={() => {
                if (selectedClient) setShowAddUpdateAccountDialog(true);
              }}
              className={
                Permissions.checkPermission(
                  currentUser?.user,
                  Permissions.Account.Add
                ) && !isTotalClient
                  ? ""
                  : "display-none"
              }
            >
              Create New Account
            </Button>
            <Button
              svgIcon={dollarIcon}
              fillMode="outline"
              themeColor={"primary"}
              size="small"
              onClick={handleBankFeesClick}
              className={
                Permissions.checkPermission(
                  currentUser?.user,
                  Permissions.Account.View
                ) && !isTotalClient
                  ? ""
                  : "display-none"
              }
            >
              Bank Fees
            </Button>
          </CardBody>
        </Card>

        <Card className="account-grid-section">
          <CardBody>
            {(accountsData || allAndTotalClientAccounts) && (
              <AccountListGrid
                isTotalClient={isTotalClient}
                accountListData={
                  !isTotalClient
                    ? accountsData
                    : allAndTotalClientAccounts?.data
                }
                contextMenuItems={
                  isTotalClient
                    ? contextMenuItems.filter((x) => x.showForTotal)
                    : contextMenuItems
                }
                handleItemSelected={handleItemSelected}
                onSelectionChange={onSelectionChange}
              />
            )}
          </CardBody>
        </Card>
      </div>
      {showAddUpdateAccountDialog && (
        <AddUpdateAccountDialog
          onClose={handleDialogClosed}
          selectedClient={selectedClient}
          selectedAccount={isEdit ? selectedAccount : null}
          accountAdded={handleAccountAddded}
        />
      )}
      {showAddUpdateOMSNoteDialog.visible && (
        <AddNewTextAreaDialog
          title={"Add OMS Note"}
          currentValue={showAddUpdateOMSNoteDialog.currentValue}
          onClose={handleOMSDialogClose}
          onSubmit={handleAddUpdateOMSDialog}
        />
      )}
    </>
  );
};
export default AccountList;
