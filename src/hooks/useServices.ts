import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    addService,
    deleteService,
    getServices,
    SalonService,
    ServiceFormData,
    toggleServiceActive,
    updateService,
} from "../services/services";

export function useServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<SalonService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await getServices(user.uid);
    setServices(data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const add = async (serviceData: ServiceFormData) => {
    if (!user) return { success: false, error: "Not logged in" };
    const result = await addService(user.uid, serviceData);
    if (result.success) await fetchServices();
    return result;
  };

  const update = async (
    serviceId: string,
    serviceData: Partial<ServiceFormData>,
  ) => {
    const result = await updateService(serviceId, serviceData);
    if (result.success) await fetchServices();
    return result;
  };

  const remove = async (serviceId: string) => {
    const result = await deleteService(serviceId);
    if (result.success) await fetchServices();
    return result;
  };

  const toggle = async (serviceId: string, isActive: boolean) => {
    const result = await toggleServiceActive(serviceId, isActive);
    if (result.success) await fetchServices();
    return result;
  };

  // Group services by category for display
  const servicesByCategory = services.reduce(
    (groups, service) => {
      const category = service.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(service);
      return groups;
    },
    {} as Record<string, SalonService[]>,
  );

  return {
    services,
    servicesByCategory,
    isLoading,
    error,
    fetchServices,
    add,
    update,
    remove,
    toggle,
  };
}
