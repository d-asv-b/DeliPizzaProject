import { motion } from "framer-motion";
import { PiXCircleFill } from "react-icons/pi";
import { PiCheckCircleFill } from "react-icons/pi";

type PasswordRequirementProps = {
    requirementText: string,
    value: boolean,
    index?: number,
};

export default function PasswordRequirement({ requirementText, value, index = 0 } : PasswordRequirementProps ) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, delay: index * 0.1 }} 
            className="flex items-center gap-2">
            {
                value ? 
                <PiCheckCircleFill className="text-green-600" size={ 20 }/>
                :
                <PiXCircleFill className="text-red-600" size={ 20 }/>
            }

            <div className="align-middle text-text-secondary">
                { requirementText }
            </div>
        </motion.div>
    );
}