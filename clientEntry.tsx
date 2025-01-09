import {
  ComboBox,
  FilterDescriptor,
  ComboBoxFilterChangeEvent,
  TabStripSelectEventArguments,
  CheckboxChangeEvent,
  Card,
  CardHeader,
  Button,
  CardBody,
  Switch,
  Checkbox,
  TabStrip,
  TabStripTab,
} from "@progress/kendo-react-all";
import { filterBy } from "@progress/kendo-data-query";
import "./clientEntry.scss";
import { plusCircleIcon, arrowLeftIcon } from "@progress/kendo-svg-icons";
import { Label } from "@progress/kendo-react-labels";
import { decode, encode } from "base-64";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useAppSelector,
  useAppDispatch,
} from "../../../store/hooks/storeHooks";
import {
  AddUpdateClientRequest,
  ClientIdAndNameResponse,
  EmployeeClientMappingDto,
  TransactInsertUpdateRequest,
} from "../../../store/services/clientServices/client.model";
import {
  useLazyGetClientWithDetailsQuery,
  useGetAllClientsQuery,
  useTransactAddUpdateClientMutation,
} from "../../../store/services/clientServices/clientService";
import { setClient } from "../../../store/slices/clientSlice";
import { handleServerError } from "../../../utils/errorHandling/errorHandler";
import { useNotification } from "../../../utils/notificationService/notificationService";
import AddNewClientDialog from "../../shared/dialogs/addNewClientDialog/addNewClientDialog";
import AccountList from "./accounts/accountList";
import ClientObjective from "./clientObjective/clientObjective";
import ClientTarget from "./clientTarget/clientTarget";
import ClientInfo from "./info/clientInfo";
import { Permissions } from "../../../routings/permissions";
import WithValueField from "../../../components/shared/dropdown/withValueField";

const DropdownWithValueField = WithValueField(ComboBox);

export interface clientAddUpdateProps {
  clientRequest: AddUpdateClientRequest;
  newClient: boolean;
  employeeMappings: EmployeeClientMappingDto[] | null;
}
export interface transactClientInsertUpdateProps {
  clientRequest: AddUpdateClientRequest;
  employeeMappings: EmployeeClientMappingDto[] | null;
}

const ClientIndex = () => {
  const { id } = useParams();
  const clientId = decode(id);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [editMode, setEditMode] = useState(false);
  const currentUser = useAppSelector((state) => state.auth);
  const { addNotifications } = useNotification();
  const client = useAppSelector((state) => state.client);
  // const clientTypes = useAppSelector((state) => state.clientTypes);
  const [clientChecks, setClientChecks] = useState({
    directCouponGeneration: false,
    discretionaryFlag: false,
    archivedFlag: false,
    ssS_Active: false,
    billable: false,
  });
  useEffect(() => {
    if (client) {
      setClientChecks({
        directCouponGeneration: client?.directCouponGeneration,
        discretionaryFlag: client?.discretionaryFlag,
        archivedFlag: client?.archivedFlag,
        ssS_Active: client?.ssS_Active,
        billable: client?.billable,
      });
    }
  }, [client, editMode]);

  const dispatch = useAppDispatch();
  const [clients, setClients] = useState<ClientIdAndNameResponse[]>([]);
  const [allClients, setAllClients] = useState<boolean>(true); //only get active clients
  const [selectedClientId, setSelectedClientId] = useState(Number(clientId));
  const [selectedClient, setSelectedClient] = useState(null);

  const [selected, setSelected] = useState<number>(0);
  const [showClientDialog, setShowClientDialog] = useState(false);

  const [getClientWithDetails] = useLazyGetClientWithDetailsQuery();
  const {
    data: filteredclients,
    isSuccess,
    refetch: refetchClientList,
  } = useGetAllClientsQuery(allClients);

  const [transactAddUpdateClient] = useTransactAddUpdateClientMutation();


  useEffect(() => {
    if (state) {
      setSelected(state.selectedTab ?? 0);
      setSelectedClientId(state.selectedClientId ?? 0);

      const client = filteredclients?.find(
        (x) => x.clientID === (state.selectedClientId ?? 0)
      );
      getClientWithDetails(state.selectedClientId)
        .unwrap()
        .then((data) => {
          dispatch(setClient(data));
        });
      setSelectedClient(client);
    } else if (clientId) {
      setSelectedClientId(Number(clientId));
      const client = filteredclients?.find(
        (x) => x.clientID === Number(clientId)
      );
      setSelectedClient(client);
      getClientWithDetails(Number(clientId))
        .unwrap()
        .then((data) => {
          dispatch(setClient(data));
        });
    }
  }, [filteredclients, state, clientId]);

  const filterData = (filter: FilterDescriptor) => {
    const data = filteredclients?.slice();
    return filterBy(data, filter);
  };

  const filterChange = (event: ComboBoxFilterChangeEvent) => {
    setClients(filterData(event.filter));
  };
  useEffect(() => {
    if (isSuccess) {
      setClients(filteredclients);
    }
  }, [filteredclients, isSuccess]);

  const clientSelected = (e) => {
    if (e.value) {
      navigate(`/operations/client/${encode(e.target.value)}`, {
        replace: true,
      });
    } else {
      navigate(`/operations/client/`);
    }
  };

  const handleSelect = (e: TabStripSelectEventArguments) => {
    navigate(`/operations/client/${encode(selectedClient?.clientID)}`, {
      state: {
        selectedClientId: selectedClient?.clientID,
        selectedTab: e.selected,
      },
    });
  };
  const handleAddNewClick = () => {
    setShowClientDialog(true);
  };
  const handleClientAdded = (data: clientAddUpdateProps) => {
    const transactAddRequest: TransactInsertUpdateRequest = {
      ...data.clientRequest,
      ssS_Active: clientChecks.ssS_Active ?? false,
      discretionaryFlag: clientChecks.discretionaryFlag ?? false,
      directCouponGeneration: clientChecks.directCouponGeneration ?? false,
      archivedFlag: clientChecks.archivedFlag ?? false,
      billable: clientChecks.billable ?? false,
      employeeClientMappings: data.employeeMappings,
      createFolder: false,
      
    };
    transactAddUpdateClient(transactAddRequest)
      .unwrap()
      .then(async (response) => {
      
        if (response.succeeded) {
          addNotifications("Operation completed successfully", "success");
          setShowClientDialog(false);

          dispatch(setClient(response?.data));
        } else {
          throw new Error(response?.messages.join(", "));
        }
      })
      .catch((error) => {
        const errors = handleServerError(error);
        addNotifications(errors, "error");
      });
    // addUpdateClient(request)
    //   .unwrap()
    //   .then(async (response) => {
    //     if (response.succeeded) {
    //       if (!data.newClient) {
    //         const clientTypeChanged = client.clientType !== request.clientType;
    //         if (clientTypeChanged) {
    //           if (new Date().getHours() >= 16) {
    //             addNotifications(
    //               "Client Type changes after 4:00 PM are not allowed, please contact IT if you want to do it after this hour.",
    //               "error"
    //             );
    //             return;
    //           } else {
    //             const factTableRequest = {
    //               ClientID: selectedClient.ClientID,
    //               ClientTypeID: clientTypes?.find(
    //                 (x) => x.clientType === response.data.clientType
    //               )?.clientTypeID,
    //             };
    //             factTableClientTypeUpdate(factTableRequest);
    //           }
    //         }
    //         if (request.archivedFlag === true) {
    //           archiveClient(data.clientRequest, response.data);
    //         }
    //       } else {
    //         if (data.employeeMappings) {
    //           const employeeMappings: BulkInsertClientEmployeeMappingsRequest =
    //             {
    //               clientId: response.data.clientID,
    //               employeeClientMappings: data.employeeMappings,
    //             };
    //           await BulkInsertEmployeeClientMappings(employeeMappings);
    //         }
    //       }
    //       addNotifications(response.messages, "success");
    //       setShowClientDialog(false);

    //       dispatch(setClient(response?.data));
    //     }
    //   })
    //   .catch((error) => {
    //     const errors = handleServerError(error);
    //     addNotifications(errors, "error");
    //   });
  };

  const handleCheckChange = (event: CheckboxChangeEvent) => {
    setClientChecks((prev) => ({ ...prev, [event.target.name]: event.value }));
  };
  const handleAllClientsCheck = () => {
    setAllClients((prev) => !prev);
    refetchClientList();
  };
  const handleBackClick = () => {
    navigate("/operations/client");
  };
  return (
    <>
      <div className="client-entry-index">
        {/* Client Filter Section */}
        <Card className="client-filter-card">
          <CardHeader className="header">
            <h2>Client Info</h2>
            <div className="back-button-div">
              <Button
                fillMode="outline"
                themeColor={"primary"}
                size="small"
                svgIcon={arrowLeftIcon}
                onClick={handleBackClick}
              >
                Back To List
              </Button>
            </div>
          </CardHeader>
          <CardBody className="client-filter-section">
            <div className="show-all-switch">
              <Switch
                size="small"
                id="showAll"
                thumbRounded="full"
                trackRounded="full"
                value={allClients}
                onChange={handleAllClientsCheck}
              />
              <Label editorId="showAll">Show All</Label>
            </div>
            <DropdownWithValueField
              className="client-dropdown"
              data={clients}
              filterable={true}
              defaultValue={selectedClient}
              valueField="clientID"
              textField="name"
              onChange={clientSelected}
              onFilterChange={filterChange}
              placeholder="Select client..."
            />
            {selectedClientId > 0 && <div>clientId: {selectedClientId}</div>}
            <Checkbox
              id={"chb1"}
              label={"Active"}
              value={clientChecks?.ssS_Active}
              name="ssS_Active"
              onChange={handleCheckChange}
              disabled={editMode}
            />
            <Checkbox
              id={"chb2"}
              label={"Archived"}
              value={clientChecks?.archivedFlag}
              name="archivedFlag"
              onChange={handleCheckChange}
              disabled={editMode}
            />
            <Checkbox
              id={"chb3"}
              label={"Discretionary"}
              value={clientChecks?.discretionaryFlag}
              name="discretionaryFlag"
              onChange={handleCheckChange}
              disabled={editMode}
            />
            <Checkbox
              id={"chb4"}
              label={"Coupen Gen."}
              value={clientChecks?.directCouponGeneration}
              name="directCouponGeneration"
              onChange={handleCheckChange}
              disabled={editMode}
            />
            <Checkbox
              id={"chb5"}
              label={"Billable"}
              value={clientChecks?.billable}
              name="billable"
              onChange={handleCheckChange}
              disabled={editMode}
            />
            <Button
              svgIcon={plusCircleIcon}
              fillMode="outline"
              themeColor={"primary"}
              size="small"
              onClick={handleAddNewClick}
              className={
                Permissions.checkPermission(
                  currentUser?.user,
                  Permissions.Client.Add
                )
                  ? ""
                  : "display-none"
              }
            >
              Add Client
            </Button>
          </CardBody>
        </Card>

        <TabStrip selected={selected} onSelect={handleSelect} animation={false}>
          <TabStripTab title="Info">
            <ClientInfo
              selectedClientId={selectedClientId}
              onSubmitUpdates={handleClientAdded}
              editMode={editMode}
              setEditMode={setEditMode}
            />
          </TabStripTab>
          <TabStripTab title="Accounts">
            <AccountList selectedClient={selectedClient} />
          </TabStripTab>
          <TabStripTab title="Targets">
            <ClientTarget selectedClientId={selectedClientId} />
          </TabStripTab>
          <TabStripTab title="Objectives">
            <ClientObjective selectedClientId={selectedClientId} />
          </TabStripTab>
        </TabStrip>
      </div>
      {showClientDialog && (
        <AddNewClientDialog
          onClose={() => {
            setShowClientDialog(false);
          }}
          onClientAdded={handleClientAdded}
        />
      )}
    </>
  );
};
export default ClientIndex;
